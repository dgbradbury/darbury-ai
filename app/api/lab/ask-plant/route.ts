import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { validateSession, getUsageCount, incrementUsage } from "@/lib/auth";
import { getDb } from "@/lib/firebase-admin";
import { getResend } from "@/lib/resend";
import { FieldValue } from "firebase-admin/firestore";

const DAILY_CAP = parseInt(process.env.LAB_ASKPLANT_DAILY_CAP ?? "6", 10);

// Canned demo dataset — stands in for a client's live Plant 3D model. Read-only.
// ponytail: hardcoded sample, not a DB. That's the whole point of the teaser.
interface Asset {
  tag: string;
  description: string;
  type: string;
  line: string;
  area: string;
  status: "Operational" | "Commissioned" | "Decommissioned" | "Maintenance";
  pidBasis: boolean;
}

const DATASET: Asset[] = [
  { tag: "P-101A", description: "Feed pump A", type: "Centrifugal pump", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "P-101B", description: "Feed pump B (standby)", type: "Centrifugal pump", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "P-201", description: "Transfer pump", type: "Centrifugal pump", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: false },
  { tag: "P-202", description: "Recycle pump", type: "Centrifugal pump", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: true },
  { tag: "P-203", description: "Slops pump", type: "Positive displacement pump", line: "L-205", area: "Unit 20 — Transfer", status: "Maintenance", pidBasis: true },
  { tag: "P-301", description: "Product pump", type: "Centrifugal pump", line: "L-300", area: "Unit 30 — Product", status: "Operational", pidBasis: true },
  { tag: "TK-10", description: "Feed storage tank", type: "Atmospheric tank", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "TK-11", description: "Buffer tank", type: "Atmospheric tank", line: "L-105", area: "Unit 10 — Feed", status: "Commissioned", pidBasis: false },
  { tag: "V-201", description: "Flash drum", type: "Vessel", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: false },
  { tag: "V-301", description: "Product separator", type: "Vessel", line: "L-300", area: "Unit 30 — Product", status: "Operational", pidBasis: true },
  { tag: "E-101", description: "Feed pre-heater", type: "Shell & tube exchanger", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "E-301", description: "Product cooler", type: "Shell & tube exchanger", line: "L-300", area: "Unit 30 — Product", status: "Maintenance", pidBasis: true },
  { tag: "C-201", description: "Recycle compressor", type: "Reciprocating compressor", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: false },
  { tag: "FV-101", description: "Feed control valve", type: "Control valve", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "FV-201", description: "Transfer control valve", type: "Control valve", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: false },
  { tag: "FV-301", description: "Product control valve", type: "Control valve", line: "L-300", area: "Unit 30 — Product", status: "Operational", pidBasis: true },
  { tag: "PSV-101", description: "Feed line relief valve", type: "Relief valve", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "PSV-301", description: "Separator relief valve", type: "Relief valve", line: "L-300", area: "Unit 30 — Product", status: "Operational", pidBasis: false },
  { tag: "FT-101", description: "Feed flow transmitter", type: "Flow instrument", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "FT-201", description: "Transfer flow transmitter", type: "Flow instrument", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: false },
  { tag: "PT-101", description: "Feed pressure transmitter", type: "Pressure instrument", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "PT-301", description: "Product pressure transmitter", type: "Pressure instrument", line: "L-300", area: "Unit 30 — Product", status: "Maintenance", pidBasis: true },
  { tag: "TT-101", description: "Pre-heater temp transmitter", type: "Temperature instrument", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "TT-201", description: "Flash drum temp transmitter", type: "Temperature instrument", line: "L-200", area: "Unit 20 — Transfer", status: "Decommissioned", pidBasis: false },
  { tag: "LT-10", description: "Feed tank level transmitter", type: "Level instrument", line: "L-100", area: "Unit 10 — Feed", status: "Operational", pidBasis: true },
  { tag: "LT-11", description: "Buffer tank level transmitter", type: "Level instrument", line: "L-105", area: "Unit 10 — Feed", status: "Commissioned", pidBasis: false },
];

interface AskResult {
  answer: string;
  matchedTags: string[];
  caveat: string;
}

const SYSTEM = `You are a plant data assistant answering natural-language questions over a read-only asset register from a Plant 3D model, on the Darbury AI Lab. You have 42 years of process-plant engineering behind you, so you read tags and lines like an engineer, not a search box.

You will be given the full asset register as JSON and a visitor's question. Answer using ONLY the data provided. Do not invent tags, lines, statuses, or attributes that are not in the register.

Return ONLY valid JSON (no markdown fences) with exactly these keys:
- answer: string — a direct, plain-English answer to the question, 1–3 short sentences. If the question can't be answered from the register, say so plainly.
- matchedTags: array of strings — the tags of every asset that satisfies the question, in register order. Empty array if none match or the question isn't a lookup.
- caveat: string — one short sentence noting any assumption you made reading the question, or "" if none.

Rules: this is a read-only query — never suggest changing, deleting, or writing data. Be precise about status and P&ID basis. No marketing language, no pricing.`;

function sanitise(s: unknown, maxLen = 300): string {
  if (typeof s !== "string") return "";
  return s.replace(/<[^>]*>/g, "").slice(0, maxLen).trim();
}

export async function POST(req: NextRequest) {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json({ error: "Session expired. Please verify again." }, { status: 401 });
    }

    const usageCount = await getUsageCount(user.email, "askplant");
    if (usageCount >= DAILY_CAP) {
      return NextResponse.json({ error: "limit_reached" }, { status: 429 });
    }

    const question = sanitise((await req.json()).question);
    if (question.length < 4) {
      return NextResponse.json({ error: "Question too short" }, { status: 400 });
    }

    const aiResponse = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 700,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Asset register:\n${JSON.stringify(DATASET)}\n\nQuestion: ${question}`,
        },
      ],
    });

    const rawText = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "{}";
    const cleaned = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

    let parsed: AskResult;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // ponytail: fall back to first {...} block if Haiku wraps the JSON in prose
      const match = cleaned.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { answer: "Couldn't read that one — try rephrasing.", matchedTags: [], caveat: "" };
    }

    const matchedTags = Array.isArray(parsed.matchedTags) ? parsed.matchedTags.slice(0, 40) : [];
    // Resolve matched tags back to full asset rows so the client can render a table
    const rows = matchedTags
      .map((t) => DATASET.find((a) => a.tag === t))
      .filter((a): a is Asset => Boolean(a));

    const inputTokens = aiResponse.usage.input_tokens;
    const outputTokens = aiResponse.usage.output_tokens;
    const costUsd = inputTokens * 0.0000008 + outputTokens * 0.000004;

    await incrementUsage(user.email, "askplant");

    let submissionId = "";
    try {
      const db = getDb();
      const docRef = await db.collection("lab_submissions").add({
        lab: "ask-the-plant",
        timestamp: FieldValue.serverTimestamp(),
        user: { name: user.name, email: user.email, company: user.company, jobTitle: user.jobTitle, phone: user.phone },
        input: { question },
        output: { answer: parsed.answer ?? "", matchedTags, caveat: parsed.caveat ?? "", rawHaikuResponse: rawText },
        aiUsage: { model: HAIKU_MODEL, inputTokens, outputTokens, costUsd: parseFloat(costUsd.toFixed(6)) },
        daveReviewed: false,
        daveNotes: "",
      });
      submissionId = docRef.id;
      console.log("[lab/ask-plant] Firestore write success", user.email, submissionId);
    } catch (e) {
      console.error("[lab/ask-plant] Firestore write failed:", e);
    }

    try {
      const daveEmail = process.env.DAVE_EMAIL;
      if (daveEmail) {
        const timestamp = new Date().toUTCString();
        const costLabel = `$${costUsd.toFixed(4)} (${inputTokens} in / ${outputTokens} out tokens)`;
        await getResend().emails.send({
          from: process.env.RESEND_FROM ?? "AILab@darbury.com",
          to: daveEmail,
          subject: `[Lab 6 Lead] ${user.name} — ${user.company} — Ask the Plant`,
          html: `
<div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;background:#0a0e14;color:#e8edf4;padding:32px;border-radius:8px;">
  <p style="font-size:11px;color:#3eb8a0;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 4px;">Darbury AI Lab · Lab 6</p>
  <h1 style="font-size:22px;margin:0 0 24px;color:#e8edf4;">Ask the Plant — Query</h1>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;text-decoration:none;">${user.name}</a></td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Company</td><td style="padding:6px 0;font-size:13px;">${user.company}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Job Title</td><td style="padding:6px 0;font-size:13px;">${user.jobTitle}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Email</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;">${user.email}</a></td></tr>
  </table>
  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Their Question</p>
  <blockquote style="margin:0 0 24px;padding:16px;background:#111820;border-left:3px solid #3eb8a0;border-radius:4px;font-size:14px;color:#e8edf4;line-height:1.6;">${question}</blockquote>
  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Answer</p>
  <p style="font-size:14px;margin:0 0 12px;line-height:1.6;">${parsed.answer ?? ""}</p>
  <p style="font-size:13px;color:#8a9bb0;margin:0 0 24px;">Matched: ${matchedTags.join(", ") || "none"}</p>
  <div style="border-top:1px solid #1e2d3d;padding-top:12px;">
    <p style="font-size:11px;color:#4a5568;margin:0 0 4px;">AI Cost: <span style="color:#3eb8a0;">${costLabel}</span></p>
    <p style="font-size:11px;color:#4a5568;margin:0;">Submission ID: ${submissionId} &middot; ${timestamp}</p>
  </div>
</div>`.trim(),
        });
      }
    } catch (e) {
      console.error("[lab/ask-plant] Dave notification failed:", e);
    }

    return NextResponse.json({ answer: parsed.answer ?? "", caveat: parsed.caveat ?? "", rows });
  } catch (err) {
    console.error("[lab/ask-plant]", err);
    return NextResponse.json({ error: "Query unavailable" }, { status: 500 });
  }
}
