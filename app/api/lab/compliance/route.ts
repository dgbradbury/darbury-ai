import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { validateSession, getUsageCount, incrementUsage } from "@/lib/auth";
import { getDb } from "@/lib/firebase-admin";
import { getResend } from "@/lib/resend";
import { FieldValue } from "firebase-admin/firestore";

const DAILY_CAP = parseInt(process.env.LAB_COMPLIANCE_DAILY_CAP ?? "3", 10);

// Whitelist of standards the checker will assess against — keep in sync with the client select.
const STANDARDS: Record<string, string> = {
  "iso-19650": "ISO 19650 — information management for BIM / digital twin delivery",
  "tag-numbering": "Tag numbering conventions (KKS / plant tag numbering consistency)",
  "equipment-naming": "Equipment and line naming / identification rules",
  "isa-5.1": "ISA-5.1 instrumentation symbols and identification",
  "general": "General engineering documentation and data-quality best practice",
};

interface Gap {
  severity: string;
  area: string;
  finding: string;
  recommendation: string;
}

const SYSTEM = `You are a standards and governance specialist with 42 years of process-plant engineering experience, reviewing a document a visitor submitted to the Darbury AI Lab. They want to know where their text falls short of a named standard.

You will be given the target standard and the document text (a spec, work instruction, tag list, or naming schema).

Return ONLY valid JSON (no markdown fences) with exactly these keys:
- overallAssessment: string — 1–2 sentences on how well the text aligns with the standard overall.
- gaps: array — one object per distinct gap you find, each with:
    - severity: string — one of "High", "Medium", "Low"
    - area: string — short label for what the gap concerns (e.g. "Tag format", "Missing metadata", "Naming inconsistency")
    - finding: string — one sentence stating precisely what is non-compliant or missing, quoting the offending value where useful.
    - recommendation: string — one concrete, actionable sentence on how to close the gap.

Rules: only report gaps you can actually justify from the text against the named standard — do not invent problems to pad the list. If the text is genuinely compliant or too short to assess, return gaps: [] and explain in overallAssessment. Order gaps High severity first. Cap at 12 gaps. Be direct and practical, no marketing language, no pricing, no commitments on behalf of Darbury.`;

export async function POST(req: NextRequest) {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json({ error: "Session expired. Please verify again." }, { status: 401 });
    }

    const usageCount = await getUsageCount(user.email, "compliance");
    if (usageCount >= DAILY_CAP) {
      return NextResponse.json({ error: "limit_reached" }, { status: 429 });
    }

    const { text, standard } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (typeof standard !== "string" || !STANDARDS[standard]) {
      return NextResponse.json({ error: "Unknown standard" }, { status: 400 });
    }

    const sanitised = text.replace(/<[^>]*>/g, "").slice(0, 4000).trim();
    if (sanitised.length < 30) {
      return NextResponse.json({ error: "Text too short to assess" }, { status: 400 });
    }

    const standardLabel = STANDARDS[standard];

    const aiResponse = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1200,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Target standard: ${standardLabel}\n\nDocument to assess:\n${sanitised}`,
        },
      ],
    });

    const rawText = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "{}";
    const cleaned = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

    let parsed: { overallAssessment: string; gaps: Gap[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // ponytail: fall back to first {...} block if Haiku wraps the JSON in prose
      const match = cleaned.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { overallAssessment: "Could not assess this text — please try again.", gaps: [] };
    }
    const gaps = Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 12) : [];

    const inputTokens = aiResponse.usage.input_tokens;
    const outputTokens = aiResponse.usage.output_tokens;
    const costUsd = inputTokens * 0.0000008 + outputTokens * 0.000004;

    await incrementUsage(user.email, "compliance");

    let submissionId = "";
    try {
      const db = getDb();
      const docRef = await db.collection("lab_submissions").add({
        lab: "compliance-gap-checker",
        timestamp: FieldValue.serverTimestamp(),
        user: {
          name: user.name,
          email: user.email,
          company: user.company,
          jobTitle: user.jobTitle,
          phone: user.phone,
        },
        input: {
          standard,
          standardLabel,
          text: sanitised,
        },
        output: {
          overallAssessment: parsed.overallAssessment ?? "",
          gapCount: gaps.length,
          gaps,
          rawHaikuResponse: rawText,
        },
        aiUsage: {
          model: HAIKU_MODEL,
          inputTokens,
          outputTokens,
          costUsd: parseFloat(costUsd.toFixed(6)),
        },
        daveReviewed: false,
        daveNotes: "",
      });
      submissionId = docRef.id;
      console.log("[lab/compliance] Firestore write success", user.email, submissionId);
    } catch (e) {
      console.error("[lab/compliance] Firestore write failed:", e);
    }

    try {
      const daveEmail = process.env.DAVE_EMAIL;
      if (daveEmail) {
        const timestamp = new Date().toUTCString();
        const costLabel = `$${costUsd.toFixed(4)} (${inputTokens} in / ${outputTokens} out tokens)`;
        const sevColour: Record<string, string> = { High: "#C94040", Medium: "#F0B425", Low: "#5BAD8A" };
        const gapRows = gaps
          .map(
            (g) => `
    <div style="border-left:3px solid ${sevColour[g.severity] ?? "#8a9bb0"};padding:8px 0 8px 14px;margin-bottom:14px;">
      <p style="font-size:11px;color:${sevColour[g.severity] ?? "#8a9bb0"};text-transform:uppercase;letter-spacing:0.1em;margin:0 0 3px;">${g.severity} &middot; ${g.area}</p>
      <p style="font-size:14px;margin:0 0 4px;line-height:1.5;color:#e8edf4;">${g.finding}</p>
      <p style="font-size:13px;margin:0;line-height:1.5;color:#8a9bb0;">→ ${g.recommendation}</p>
    </div>`
          )
          .join("");

        await getResend().emails.send({
          from: process.env.RESEND_FROM ?? "AILab@darbury.com",
          to: daveEmail,
          subject: `[Lab 5 Lead] ${user.name} — ${user.company} — Compliance Gap Checker (${gaps.length} gaps)`,
          html: `
<div style="font-family:system-ui,sans-serif;max-width:660px;margin:0 auto;background:#0a0e14;color:#e8edf4;padding:32px;border-radius:8px;">
  <p style="font-size:11px;color:#3eb8a0;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 4px;">Darbury AI Lab · Lab 5</p>
  <h1 style="font-size:22px;margin:0 0 24px;color:#e8edf4;">Compliance Gap Check — ${gaps.length} gaps</h1>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;text-decoration:none;">${user.name}</a></td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Company</td><td style="padding:6px 0;font-size:13px;">${user.company}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Job Title</td><td style="padding:6px 0;font-size:13px;">${user.jobTitle}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Email</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;">${user.email}</a></td></tr>
  </table>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Checked Against</p>
  <p style="font-size:14px;margin:0 0 20px;">${standardLabel}</p>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Their Text</p>
  <blockquote style="margin:0 0 24px;padding:16px;background:#111820;border-left:3px solid #3eb8a0;border-radius:4px;font-size:13px;color:#e8edf4;line-height:1.6;white-space:pre-wrap;">${sanitised}</blockquote>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Overall Assessment</p>
  <p style="font-size:14px;margin:0 0 20px;line-height:1.6;">${parsed.overallAssessment ?? ""}</p>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Gaps</p>
  <div style="background:#111820;border:1px solid #1e2d3d;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
    ${gapRows || `<p style="font-size:13px;color:#8a9bb0;margin:0;">No gaps flagged.</p>`}
  </div>

  <div style="border-top:1px solid #1e2d3d;padding-top:12px;margin-top:20px;">
    <p style="font-size:11px;color:#4a5568;margin:0 0 4px;">AI Cost: <span style="color:#3eb8a0;">${costLabel}</span></p>
    <p style="font-size:11px;color:#4a5568;margin:0;">Submission ID: ${submissionId} &middot; ${timestamp}</p>
  </div>
</div>
          `.trim(),
        });
      }
    } catch (e) {
      console.error("[lab/compliance] Dave notification failed:", e);
    }

    return NextResponse.json({
      overallAssessment: parsed.overallAssessment ?? "",
      gaps,
      standardLabel,
    });
  } catch (err) {
    console.error("[lab/compliance]", err);
    return NextResponse.json({ error: "Assessment unavailable" }, { status: 500 });
  }
}
