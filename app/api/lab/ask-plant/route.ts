import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { validateSession, getUsageCount, incrementUsage } from "@/lib/auth";
import { getDb } from "@/lib/firebase-admin";
import { getResend } from "@/lib/resend";
import { FieldValue } from "firebase-admin/firestore";
import { DATASET, ASK_PLANT_SYSTEM as SYSTEM, type Asset } from "@/lib/ask-plant";

const DAILY_CAP = parseInt(process.env.LAB_ASKPLANT_DAILY_CAP ?? "6", 10);

interface AskResult {
  answer: string;
  matchedTags: string[];
  caveat: string;
}

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
  <p style="font-size:11px;color:#189B93;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 4px;">Darbury AI Lab · Lab 6</p>
  <h1 style="font-size:22px;margin:0 0 24px;color:#e8edf4;">Ask the Plant — Query</h1>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#189B93;text-decoration:none;">${user.name}</a></td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Company</td><td style="padding:6px 0;font-size:13px;">${user.company}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Job Title</td><td style="padding:6px 0;font-size:13px;">${user.jobTitle}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Email</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#189B93;">${user.email}</a></td></tr>
  </table>
  <p style="font-size:12px;color:#189B93;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Their Question</p>
  <blockquote style="margin:0 0 24px;padding:16px;background:#111820;border-left:3px solid #189B93;border-radius:4px;font-size:14px;color:#e8edf4;line-height:1.6;">${question}</blockquote>
  <p style="font-size:12px;color:#189B93;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Answer</p>
  <p style="font-size:14px;margin:0 0 12px;line-height:1.6;">${parsed.answer ?? ""}</p>
  <p style="font-size:13px;color:#8a9bb0;margin:0 0 24px;">Matched: ${matchedTags.join(", ") || "none"}</p>
  <div style="border-top:1px solid #1e2d3d;padding-top:12px;">
    <p style="font-size:11px;color:#4a5568;margin:0 0 4px;">AI Cost: <span style="color:#189B93;">${costLabel}</span></p>
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
