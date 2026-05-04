import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { validateSession, getUsageCount, incrementUsage } from "@/lib/auth";
import { getDb } from "@/lib/firebase-admin";
import { getResend } from "@/lib/resend";
import { FieldValue } from "firebase-admin/firestore";

const DAILY_CAP = parseInt(process.env.LAB_BRIEF_DAILY_CAP ?? "3", 10);

const SYSTEM = `You are an expert engineering technology consultant with 42 years of experience in industrial automation, CAD systems, AI tooling, and process engineering. A visitor has submitted an engineering problem or workflow challenge to the Darbury AI Lab.

Analyse their submission and return a JSON object with exactly these keys:
- automationApproach: string — the most likely automation or AI approach to address this problem (1–2 sentences; be specific — name technologies, methods, and patterns where relevant)
- suggestedToolchain: string[] — 3–5 specific tools, platforms, or technologies you would consider (e.g. "Python", "AutoCAD API", "Anthropic Claude", "Power Automate")
- narrative: string — one paragraph describing what a working solution might look like in practice, written for a technical but non-developer audience

Keep your response practical, direct, and engineering-focused. Avoid marketing language. Do not quote specific pricing or timelines. Do not make commitments on behalf of Darbury Ltd. If the problem is too vague to assess meaningfully, set automationApproach to your clarifying question, suggestedToolchain to [], and narrative to "".

Return only valid JSON, no markdown fences. Max response length: 350 tokens.`;

export async function POST(req: NextRequest) {
  try {
    // 1. Validate session
    const user = await validateSession();
    if (!user) {
      return NextResponse.json(
        { error: "Session expired. Please verify again." },
        { status: 401 }
      );
    }

    // 2. Check daily usage cap
    const usageCount = await getUsageCount(user.email, "brief");
    if (usageCount >= DAILY_CAP) {
      return NextResponse.json({ error: "limit_reached" }, { status: 429 });
    }

    // 3. Parse and validate input
    const { problem } = await req.json();
    if (!problem || typeof problem !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Strip HTML tags and enforce length
    const sanitised = problem.replace(/<[^>]*>/g, "").slice(0, 1000).trim();
    if (sanitised.length < 20) {
      return NextResponse.json({ error: "Problem description too short" }, { status: 400 });
    }

    // 4. Call Anthropic Haiku
    const aiResponse = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 600,
      system: SYSTEM,
      messages: [{ role: "user", content: `Engineering problem submitted: ${sanitised}` }],
    });

    const rawText =
      aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "{}";
    const result = JSON.parse(rawText) as {
      automationApproach: string;
      suggestedToolchain: string[];
      narrative: string;
    };

    // 5. Increment usage counter
    await incrementUsage(user.email, "brief");

    // 6. Log to Firestore
    let submissionId = "";
    try {
      const db = getDb();
      const docRef = await db.collection("lab_submissions").add({
        lab: "brief-analyser",
        timestamp: FieldValue.serverTimestamp(),
        user: {
          name: user.name,
          email: user.email,
          company: user.company,
          jobTitle: user.jobTitle,
          phone: user.phone,
        },
        input: {
          problemText: sanitised,
        },
        output: {
          automationApproach: result.automationApproach,
          suggestedToolchain: result.suggestedToolchain,
          narrative: result.narrative,
          rawHaikuResponse: rawText,
        },
        daveReviewed: false,
        daveNotes: "",
      });
      submissionId = docRef.id;
      console.log("[lab/brief] Firestore write success", user.email, submissionId);
    } catch (e) {
      console.error("[lab/brief] Firestore write failed:", e);
    }

    // 7. Notify Dave
    try {
      const daveEmail = process.env.DAVE_EMAIL;
      if (daveEmail) {
        const toolchainList = (result.suggestedToolchain ?? []).join(", ");
        const timestamp = new Date().toUTCString();

        await getResend().emails.send({
          from: process.env.RESEND_FROM ?? "AILab@darbury.com",
          to: daveEmail,
          subject: `[Lab 1 Lead] ${user.name} — ${user.company} — Engineering Brief`,
          html: `
<div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;background:#0a0e14;color:#e8edf4;padding:32px;border-radius:8px;">
  <p style="font-size:11px;color:#3eb8a0;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 4px;">Darbury AI Lab · Lab 1</p>
  <h1 style="font-size:22px;margin:0 0 24px;color:#e8edf4;">New Engineering Brief Submission</h1>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;text-decoration:none;">${user.name}</a></td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Company</td><td style="padding:6px 0;font-size:13px;">${user.company}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Job Title</td><td style="padding:6px 0;font-size:13px;">${user.jobTitle}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Phone</td><td style="padding:6px 0;font-size:13px;">${user.phone}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Email</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;">${user.email}</a></td></tr>
  </table>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Their Problem</p>
  <blockquote style="margin:0 0 24px;padding:16px;background:#111820;border-left:3px solid #3eb8a0;border-radius:4px;font-size:14px;color:#e8edf4;line-height:1.6;">${sanitised}</blockquote>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">AI Assessment</p>
  <div style="background:#111820;border:1px solid #1e2d3d;border-radius:6px;padding:20px;margin-bottom:24px;">
    <p style="font-size:11px;color:#8a9bb0;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Automation Approach</p>
    <p style="font-size:14px;margin:0 0 16px;line-height:1.6;">${result.automationApproach}</p>

    <p style="font-size:11px;color:#8a9bb0;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Suggested Toolchain</p>
    <p style="font-size:14px;margin:0 0 16px;color:#3eb8a0;">${toolchainList}</p>

    <p style="font-size:11px;color:#8a9bb0;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">What This Could Look Like</p>
    <p style="font-size:14px;margin:0;line-height:1.6;">${result.narrative}</p>
  </div>

  <p style="font-size:11px;color:#4a5568;margin:0;">Submission ID: ${submissionId} &middot; ${timestamp}</p>
</div>
          `.trim(),
        });
      }
    } catch (e) {
      console.error("[lab/brief] Dave notification failed:", e);
    }

    return NextResponse.json({
      automationApproach: result.automationApproach,
      suggestedToolchain: result.suggestedToolchain,
      narrative: result.narrative,
      submissionId,
    });
  } catch (err) {
    console.error("[lab/brief]", err);
    return NextResponse.json({ error: "Analysis unavailable" }, { status: 500 });
  }
}
