import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { validateSession, getUsageCount, incrementUsage } from "@/lib/auth";
import { getDb } from "@/lib/firebase-admin";
import { getResend } from "@/lib/resend";
import { FieldValue } from "firebase-admin/firestore";

const DAILY_CAP = parseInt(process.env.LAB_ADVISOR_DAILY_CAP ?? "3", 10);

// Keep value keys in sync with the client selects.
const SENSITIVITY: Record<string, string> = {
  public: "Non-sensitive / already public data",
  commercial: "Commercially sensitive but not regulated",
  regulated: "Regulated or contractually restricted (ITAR, export control, client NDA)",
  airgapped: "Must never leave site / air-gapped environment",
};
const VOLUME: Record<string, string> = {
  occasional: "Occasional — a few runs a week",
  daily: "Daily — regular batches",
  heavy: "Heavy / continuous — many runs per day or streaming",
};
const HARDWARE: Record<string, string> = {
  none: "No dedicated hardware — office laptops only",
  workstation: "A capable workstation or two (decent GPU / Apple Silicon)",
  server: "On-prem server or GPU box available",
  unsure: "Not sure what we have",
};

interface AdvisorResult {
  recommendation: string;
  headline: string;
  model: string;
  hardware: string;
  reasoning: string[];
  caveat: string;
}

const SYSTEM = `You are Dave Bradbury's AI-deployment advisor, drawing on the Darbury "Local vs Cloud" playbook and real bench-testing of models on modest hardware. A visitor on the Darbury AI Lab has described their data sensitivity, workflow and hardware. Give them a straight, self-serve recommendation on running AI in the cloud (Claude) versus on-prem (Ollama / local models).

You will be given: data sensitivity, a free-text workflow description, expected volume, and current hardware.

Return ONLY valid JSON (no markdown fences) with exactly these keys:
- recommendation: string — one of "Cloud (Claude)", "On-prem (Ollama)", or "Hybrid".
- headline: string — one sentence stating the recommendation and the single biggest reason for it.
- model: string — a concrete model suggestion (e.g. "Claude Sonnet for reasoning, Haiku for bulk extraction" or "A quantised 8–14B local model such as Llama or Qwen").
- hardware: string — one sentence on the hardware that implies (rough spec), or "No new hardware needed" for cloud.
- reasoning: array of 3–5 short strings — the practical points behind the call, each one sentence, grounded in their sensitivity/volume/hardware.
- caveat: string — one honest limitation or thing to check before committing.

Rules: lead with data sensitivity — regulated or air-gapped data pushes towards on-prem even at a capability cost, and say so plainly. Be practical, no marketing language, no pricing figures, no over-promising. Write as Dave would: direct, first-person where natural, no corporate waffle.`;

function sanitise(s: unknown, maxLen = 600): string {
  if (typeof s !== "string") return "";
  return s.replace(/<[^>]*>/g, "").slice(0, maxLen).trim();
}

export async function POST(req: NextRequest) {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json({ error: "Session expired. Please verify again." }, { status: 401 });
    }

    const usageCount = await getUsageCount(user.email, "advisor");
    if (usageCount >= DAILY_CAP) {
      return NextResponse.json({ error: "limit_reached" }, { status: 429 });
    }

    const body = await req.json();
    const sensitivity = sanitise(body.sensitivity, 40);
    const volume = sanitise(body.volume, 40);
    const hardware = sanitise(body.hardware, 40);
    const workflow = sanitise(body.workflow, 1200);

    if (!SENSITIVITY[sensitivity] || !VOLUME[volume] || !HARDWARE[hardware]) {
      return NextResponse.json({ error: "Invalid selection" }, { status: 400 });
    }
    if (workflow.length < 20) {
      return NextResponse.json({ error: "Please describe your workflow" }, { status: 400 });
    }

    const prompt = `Data sensitivity: ${SENSITIVITY[sensitivity]}
Workflow: ${workflow}
Expected volume: ${VOLUME[volume]}
Current hardware: ${HARDWARE[hardware]}

Recommend cloud vs on-prem for this visitor.`;

    const aiResponse = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 900,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "{}";
    const cleaned = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

    let parsed: AdvisorResult;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      parsed = match
        ? JSON.parse(match[0])
        : { recommendation: "Hybrid", headline: "Couldn't assess that cleanly — try again.", model: "", hardware: "", reasoning: [], caveat: "" };
    }
    const reasoning = Array.isArray(parsed.reasoning) ? parsed.reasoning.slice(0, 5) : [];

    const inputTokens = aiResponse.usage.input_tokens;
    const outputTokens = aiResponse.usage.output_tokens;
    const costUsd = inputTokens * 0.0000008 + outputTokens * 0.000004;

    await incrementUsage(user.email, "advisor");

    let submissionId = "";
    try {
      const db = getDb();
      const docRef = await db.collection("lab_submissions").add({
        lab: "ai-advisor",
        timestamp: FieldValue.serverTimestamp(),
        user: { name: user.name, email: user.email, company: user.company, jobTitle: user.jobTitle, phone: user.phone },
        input: { sensitivity: SENSITIVITY[sensitivity], volume: VOLUME[volume], hardware: HARDWARE[hardware], workflow },
        output: { ...parsed, reasoning, rawHaikuResponse: rawText },
        aiUsage: { model: HAIKU_MODEL, inputTokens, outputTokens, costUsd: parseFloat(costUsd.toFixed(6)) },
        daveReviewed: false,
        daveNotes: "",
      });
      submissionId = docRef.id;
      console.log("[lab/ai-advisor] Firestore write success", user.email, submissionId);
    } catch (e) {
      console.error("[lab/ai-advisor] Firestore write failed:", e);
    }

    try {
      const daveEmail = process.env.DAVE_EMAIL;
      if (daveEmail) {
        const timestamp = new Date().toUTCString();
        const costLabel = `$${costUsd.toFixed(4)} (${inputTokens} in / ${outputTokens} out tokens)`;
        const reasoningRows = reasoning.map((r) => `<li style="font-size:13px;color:#c8d3e0;line-height:1.6;margin:0 0 6px;">${r}</li>`).join("");
        await getResend().emails.send({
          from: process.env.RESEND_FROM ?? "AILab@darbury.com",
          to: daveEmail,
          subject: `[Lab 7 Lead] ${user.name} — ${user.company} — AI Advisor (${parsed.recommendation})`,
          html: `
<div style="font-family:system-ui,sans-serif;max-width:660px;margin:0 auto;background:#0a0e14;color:#e8edf4;padding:32px;border-radius:8px;">
  <p style="font-size:11px;color:#3eb8a0;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 4px;">Darbury AI Lab · Lab 7</p>
  <h1 style="font-size:22px;margin:0 0 24px;color:#e8edf4;">Cloud-or-Local Advisor — ${parsed.recommendation}</h1>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;text-decoration:none;">${user.name}</a></td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Company</td><td style="padding:6px 0;font-size:13px;">${user.company}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Job Title</td><td style="padding:6px 0;font-size:13px;">${user.jobTitle}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Email</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;">${user.email}</a></td></tr>
  </table>
  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Their Inputs</p>
  <div style="background:#111820;border:1px solid #1e2d3d;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
    <p style="font-size:13px;color:#e8edf4;margin:0 0 8px;"><strong>Sensitivity:</strong> ${SENSITIVITY[sensitivity]}</p>
    <p style="font-size:13px;color:#e8edf4;margin:0 0 8px;"><strong>Volume:</strong> ${VOLUME[volume]}</p>
    <p style="font-size:13px;color:#e8edf4;margin:0 0 8px;"><strong>Hardware:</strong> ${HARDWARE[hardware]}</p>
    <p style="font-size:13px;color:#8a9bb0;margin:0;line-height:1.6;"><strong style="color:#e8edf4;">Workflow:</strong> ${workflow}</p>
  </div>
  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Recommendation</p>
  <p style="font-size:15px;color:#e8edf4;margin:0 0 12px;line-height:1.6;">${parsed.headline ?? ""}</p>
  <p style="font-size:13px;color:#c8d3e0;margin:0 0 4px;"><strong>Model:</strong> ${parsed.model ?? ""}</p>
  <p style="font-size:13px;color:#c8d3e0;margin:0 0 12px;"><strong>Hardware:</strong> ${parsed.hardware ?? ""}</p>
  <ul style="margin:0 0 12px;padding-left:18px;">${reasoningRows}</ul>
  <p style="font-size:13px;color:#8a9bb0;margin:0 0 24px;font-style:italic;">${parsed.caveat ?? ""}</p>
  <div style="border-top:1px solid #1e2d3d;padding-top:12px;">
    <p style="font-size:11px;color:#4a5568;margin:0 0 4px;">AI Cost: <span style="color:#3eb8a0;">${costLabel}</span></p>
    <p style="font-size:11px;color:#4a5568;margin:0;">Submission ID: ${submissionId} &middot; ${timestamp}</p>
  </div>
</div>`.trim(),
        });
      }
    } catch (e) {
      console.error("[lab/ai-advisor] Dave notification failed:", e);
    }

    return NextResponse.json({ ...parsed, reasoning });
  } catch (err) {
    console.error("[lab/ai-advisor]", err);
    return NextResponse.json({ error: "Recommendation unavailable" }, { status: 500 });
  }
}
