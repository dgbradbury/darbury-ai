import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { validateSession, getUsageCount, incrementUsage } from "@/lib/auth";
import { getDb } from "@/lib/firebase-admin";
import { getResend } from "@/lib/resend";
import { FieldValue } from "firebase-admin/firestore";

const DAILY_CAP = parseInt(process.env.LAB_READINESS_DAILY_CAP ?? "3", 10);

// Keep value keys in sync with the client selects.
const CENTRAL: Record<string, string> = {
  scattered: "Scattered across drives, inboxes & individuals",
  shared: "On a shared drive or SharePoint, loosely organised",
  system: "In a managed system (EDMS, asset register, CMMS)",
  integrated: "Integrated across systems with a single source of truth",
};
const FORMATS: Record<string, string> = {
  paper: "Mostly paper, scans & PDFs",
  office: "Spreadsheets & office documents",
  cad: "Native CAD / drawings (AutoCAD, Plant 3D, Revit)",
  structured: "Structured data / databases with tag references",
};
const LIVE: Record<string, string> = {
  none: "No live data — static records only",
  some: "Some live feeds (SCADA, IoT) but not linked to asset records",
  linked: "Live data linked to specific assets",
};

interface Dimension {
  name: string;
  score: number;
  note: string;
}
interface Stage {
  stage: string;
  title: string;
  actions: string[];
}
interface ReadinessResult {
  score: number;
  band: string;
  summary: string;
  dimensions: Dimension[];
  roadmap: Stage[];
}

const SYSTEM = `You are Dave Bradbury's digital-twin readiness assessor, built on the Darbury philosophy: start small, build on known pockets of data, show the company what's achievable, then take the next step. A visitor on the Darbury AI Lab has described the state of their asset data. Score their digital-twin readiness and give them a staged roadmap.

You will be given: how centralised their data is, the dominant formats, whether they have live data, and a free-text description.

Return ONLY valid JSON (no markdown fences) with exactly these keys:
- score: integer 0–100 — overall digital-twin readiness.
- band: string — one of "Nascent", "Developing", "Established", "Advanced" matching the score (0–25 Nascent, 26–50 Developing, 51–75 Established, 76–100 Advanced).
- summary: string — 1–2 sentences on where they are and the single most valuable next move.
- dimensions: array of 3–4 objects, each { name: string (e.g. "Data centralisation", "Data quality", "Drawing intelligence", "Live data"), score: integer 0–100, note: one short sentence }.
- roadmap: array of exactly 3 objects, each { stage: string (e.g. "Stage 1 — Now"), title: string, actions: array of 2–3 short imperative strings }. Order the roadmap so early stages build on the pockets of data they already have, later stages add integration and live data.

Rules: score honestly against real digital-twin maturity — do not inflate. Ground every note and action in what they told you. No marketing language, no pricing. Write plainly, as Dave would.`;

function sanitise(s: unknown, maxLen = 1200): string {
  if (typeof s !== "string") return "";
  return s.replace(/<[^>]*>/g, "").slice(0, maxLen).trim();
}

function clampScore(n: unknown): number {
  const v = typeof n === "number" ? n : 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export async function POST(req: NextRequest) {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json({ error: "Session expired. Please verify again." }, { status: 401 });
    }

    const usageCount = await getUsageCount(user.email, "readiness");
    if (usageCount >= DAILY_CAP) {
      return NextResponse.json({ error: "limit_reached" }, { status: 429 });
    }

    const body = await req.json();
    const central = sanitise(body.central, 40);
    const formats = sanitise(body.formats, 40);
    const live = sanitise(body.live, 40);
    const description = sanitise(body.description, 1200);

    if (!CENTRAL[central] || !FORMATS[formats] || !LIVE[live]) {
      return NextResponse.json({ error: "Invalid selection" }, { status: 400 });
    }
    if (description.length < 20) {
      return NextResponse.json({ error: "Please describe your asset data" }, { status: 400 });
    }

    const prompt = `How centralised: ${CENTRAL[central]}
Dominant formats: ${FORMATS[formats]}
Live data: ${LIVE[live]}
Their description: ${description}
Company: ${user.company}

Score their digital-twin readiness and give a staged roadmap.`;

    const aiResponse = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1100,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "{}";
    const cleaned = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

    let parsed: ReadinessResult;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      parsed = match
        ? JSON.parse(match[0])
        : { score: 0, band: "Nascent", summary: "Couldn't score that cleanly — try again.", dimensions: [], roadmap: [] };
    }

    const score = clampScore(parsed.score);
    const dimensions = (Array.isArray(parsed.dimensions) ? parsed.dimensions : [])
      .slice(0, 4)
      .map((d) => ({ name: String(d.name ?? ""), score: clampScore(d.score), note: String(d.note ?? "") }));
    const roadmap = (Array.isArray(parsed.roadmap) ? parsed.roadmap : []).slice(0, 3).map((s) => ({
      stage: String(s.stage ?? ""),
      title: String(s.title ?? ""),
      actions: Array.isArray(s.actions) ? s.actions.slice(0, 3).map(String) : [],
    }));

    const inputTokens = aiResponse.usage.input_tokens;
    const outputTokens = aiResponse.usage.output_tokens;
    const costUsd = inputTokens * 0.0000008 + outputTokens * 0.000004;

    await incrementUsage(user.email, "readiness");

    let submissionId = "";
    try {
      const db = getDb();
      const docRef = await db.collection("lab_submissions").add({
        lab: "digital-twin-readiness",
        timestamp: FieldValue.serverTimestamp(),
        user: { name: user.name, email: user.email, company: user.company, jobTitle: user.jobTitle, phone: user.phone },
        input: { central: CENTRAL[central], formats: FORMATS[formats], live: LIVE[live], description },
        output: { score, band: parsed.band ?? "", summary: parsed.summary ?? "", dimensions, roadmap, rawHaikuResponse: rawText },
        aiUsage: { model: HAIKU_MODEL, inputTokens, outputTokens, costUsd: parseFloat(costUsd.toFixed(6)) },
        daveReviewed: false,
        daveNotes: "",
      });
      submissionId = docRef.id;
      console.log("[lab/readiness] Firestore write success", user.email, submissionId);
    } catch (e) {
      console.error("[lab/readiness] Firestore write failed:", e);
    }

    try {
      const daveEmail = process.env.DAVE_EMAIL;
      if (daveEmail) {
        const timestamp = new Date().toUTCString();
        const costLabel = `$${costUsd.toFixed(4)} (${inputTokens} in / ${outputTokens} out tokens)`;
        const dimRows = dimensions
          .map((d) => `<p style="font-size:13px;color:#c8d3e0;margin:0 0 6px;"><strong style="color:#e8edf4;">${d.name}: ${d.score}/100</strong> — ${d.note}</p>`)
          .join("");
        const stageRows = roadmap
          .map(
            (s) => `<div style="margin-bottom:12px;"><p style="font-size:12px;color:#3eb8a0;margin:0 0 2px;">${s.stage} — ${s.title}</p><p style="font-size:13px;color:#c8d3e0;margin:0;">${s.actions.join(" · ")}</p></div>`
          )
          .join("");
        await getResend().emails.send({
          from: process.env.RESEND_FROM ?? "AILab@darbury.com",
          to: daveEmail,
          subject: `[Lab 8 Lead] ${user.name} — ${user.company} — DT Readiness (${score}/100, ${parsed.band})`,
          html: `
<div style="font-family:system-ui,sans-serif;max-width:660px;margin:0 auto;background:#0a0e14;color:#e8edf4;padding:32px;border-radius:8px;">
  <p style="font-size:11px;color:#3eb8a0;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 4px;">Darbury AI Lab · Lab 8</p>
  <h1 style="font-size:22px;margin:0 0 24px;color:#e8edf4;">Digital Twin Readiness — ${score}/100 (${parsed.band})</h1>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;text-decoration:none;">${user.name}</a></td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Company</td><td style="padding:6px 0;font-size:13px;">${user.company}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Job Title</td><td style="padding:6px 0;font-size:13px;">${user.jobTitle}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Email</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;">${user.email}</a></td></tr>
  </table>
  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Their Inputs</p>
  <div style="background:#111820;border:1px solid #1e2d3d;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
    <p style="font-size:13px;color:#e8edf4;margin:0 0 8px;"><strong>Centralisation:</strong> ${CENTRAL[central]}</p>
    <p style="font-size:13px;color:#e8edf4;margin:0 0 8px;"><strong>Formats:</strong> ${FORMATS[formats]}</p>
    <p style="font-size:13px;color:#e8edf4;margin:0 0 8px;"><strong>Live data:</strong> ${LIVE[live]}</p>
    <p style="font-size:13px;color:#8a9bb0;margin:0;line-height:1.6;"><strong style="color:#e8edf4;">Description:</strong> ${description}</p>
  </div>
  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Summary</p>
  <p style="font-size:14px;color:#e8edf4;margin:0 0 16px;line-height:1.6;">${parsed.summary ?? ""}</p>
  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Dimensions</p>
  ${dimRows}
  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:16px 0 8px;">Roadmap</p>
  ${stageRows}
  <div style="border-top:1px solid #1e2d3d;padding-top:12px;margin-top:12px;">
    <p style="font-size:11px;color:#4a5568;margin:0 0 4px;">AI Cost: <span style="color:#3eb8a0;">${costLabel}</span></p>
    <p style="font-size:11px;color:#4a5568;margin:0;">Submission ID: ${submissionId} &middot; ${timestamp}</p>
  </div>
</div>`.trim(),
        });
      }
    } catch (e) {
      console.error("[lab/readiness] Dave notification failed:", e);
    }

    return NextResponse.json({ score, band: parsed.band ?? "", summary: parsed.summary ?? "", dimensions, roadmap });
  } catch (err) {
    console.error("[lab/readiness]", err);
    return NextResponse.json({ error: "Scoring unavailable" }, { status: 500 });
  }
}
