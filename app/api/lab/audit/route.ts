import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { validateSession, getUsageCount, incrementUsage } from "@/lib/auth";
import { getDb } from "@/lib/firebase-admin";
import { getResend } from "@/lib/resend";
import { FieldValue } from "firebase-admin/firestore";

const DAILY_CAP = parseInt(process.env.LAB_AUDIT_DAILY_CAP ?? "3", 10);

// ─── Types ───────────────────────────────────────────────────────────────────

interface Opportunity {
  title: string;
  description: string;
  impact: string;
}

interface Report {
  reportTitle: string;
  intro: string;
  opportunities: [Opportunity, Opportunity, Opportunity];
  closing: string;
}

interface AuditAnswers {
  q1_toolstack: string;
  q2_timeLoss: string[];
  q3_currentAutomation: string;
  q3_automationDetail: string;
  q4_successCriteria: string;
  q5_barriers: string[];
}

// ─── Haiku prompt ────────────────────────────────────────────────────────────

const SYSTEM = `You are an expert engineering technology consultant with 42 years of experience in industrial automation, CAD systems, AI tooling, and process engineering. A visitor has completed a workflow audit questionnaire on the Darbury AI Lab.

Based on their answers, generate a personalised report identifying exactly 3 automation opportunities specific to their situation. Each opportunity should be:
- Concrete and specific to what they told you — not generic advice
- Named clearly (give each opportunity a short, memorable title)
- Described in 2–3 sentences covering what it is, why it fits their situation, and what the outcome would be
- Realistic for an engineering or industrial business context

Return ONLY a valid JSON object with this exact structure — no preamble, no markdown fences, no additional text:
{
  "reportTitle": "3 Automation Opportunities for {their company name or 'Your Team'}",
  "intro": "One sentence personalised introduction referencing their specific context",
  "opportunities": [
    {
      "title": "Short opportunity name",
      "description": "2–3 sentence description specific to their answers",
      "impact": "One-line outcome statement"
    },
    {
      "title": "...",
      "description": "...",
      "impact": "..."
    },
    {
      "title": "...",
      "description": "...",
      "impact": "..."
    }
  ],
  "closing": "One sentence closing that acknowledges their stated barrier and positions Dave Bradbury at Darbury Ltd as the right person to help overcome it"
}`;

function buildPrompt(answers: AuditAnswers, userName: string, company: string): string {
  const lines = [
    `Visitor workflow audit:`,
    ``,
    `Tools used daily: ${answers.q1_toolstack}`,
    ``,
    `Biggest time losses: ${answers.q2_timeLoss.join(", ")}`,
    ``,
    `Current automation status: ${answers.q3_currentAutomation}`,
    answers.q3_automationDetail.trim()
      ? `Current automation detail: ${answers.q3_automationDetail}`
      : null,
    ``,
    `What success looks like: ${answers.q4_successCriteria}`,
    ``,
    `Biggest barriers: ${answers.q5_barriers.join(", ")}`,
    ``,
    `Visitor name: ${userName}`,
    `Company: ${company}`,
    ``,
    `Generate 3 specific automation opportunities for this visitor.`,
  ];
  return lines.filter((l) => l !== null).join("\n");
}

function isValidReport(r: unknown): r is Report {
  if (typeof r !== "object" || r === null) return false;
  const obj = r as Record<string, unknown>;
  if (
    typeof obj.reportTitle !== "string" ||
    typeof obj.intro !== "string" ||
    typeof obj.closing !== "string" ||
    !Array.isArray(obj.opportunities) ||
    obj.opportunities.length !== 3
  )
    return false;
  return (obj.opportunities as unknown[]).every(
    (o) =>
      typeof o === "object" &&
      o !== null &&
      typeof (o as Record<string, unknown>).title === "string" &&
      typeof (o as Record<string, unknown>).description === "string" &&
      typeof (o as Record<string, unknown>).impact === "string"
  );
}

async function generateReport(prompt: string): Promise<{ report: Report; raw: string }> {
  // Attempt up to 2 times on malformed JSON
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 900,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";

    try {
      // Strip accidental markdown fences if Haiku adds them despite instructions
      const cleaned = raw.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
      const parsed = JSON.parse(cleaned);
      if (isValidReport(parsed)) return { report: parsed, raw };
    } catch {
      // fall through to retry
    }

    if (attempt === 1) throw new Error("Haiku returned invalid report structure after retry");
  }
  throw new Error("Unreachable");
}

// ─── Email helpers ────────────────────────────────────────────────────────────

function oppHtml(opp: Opportunity, num: number): string {
  return `
    <div style="margin-bottom:20px;padding:16px;background:#111820;border-left:3px solid #3eb8a0;border-radius:4px;">
      <p style="font-size:11px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Opportunity ${num}</p>
      <p style="font-size:15px;font-weight:600;color:#e8edf4;margin:0 0 8px;">${opp.title}</p>
      <p style="font-size:13px;color:#c8d3e0;line-height:1.6;margin:0 0 8px;">${opp.description}</p>
      <p style="font-size:12px;color:#3eb8a0;margin:0;">→ ${opp.impact}</p>
    </div>`;
}

function visitorEmailHtml(
  report: Report,
  user: { name: string; email: string; company: string },
  date: string
): string {
  return `
<div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;background:#0a0e14;color:#e8edf4;padding:32px;border-radius:8px;">
  <p style="font-size:11px;color:#3eb8a0;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 4px;">Darbury AI Lab · Lab 3</p>
  <h1 style="font-size:20px;margin:0 0 4px;color:#e8edf4;">${report.reportTitle}</h1>
  <p style="font-size:12px;color:#8a9bb0;margin:0 0 24px;">Prepared for ${user.name} &middot; ${date}</p>

  <p style="font-size:14px;color:#c8d3e0;line-height:1.7;margin:0 0 24px;">${report.intro}</p>

  ${report.opportunities.map((o, i) => oppHtml(o, i + 1)).join("")}

  <p style="font-size:14px;color:#c8d3e0;line-height:1.7;margin:24px 0;">${report.closing}</p>

  <div style="border-top:1px solid #1e2d3d;padding-top:20px;margin-top:24px;">
    <p style="font-size:13px;color:#8a9bb0;margin:0 0 16px;">This report was generated based on the workflow audit you completed on the Darbury AI Lab. Dave Bradbury reviews every submission. If any of these opportunities resonate, the next step is a conversation — no commitment required.</p>
    <a href="https://darbury.com/contact" style="display:inline-block;background:#3eb8a0;color:#0a0e14;padding:10px 20px;border-radius:4px;text-decoration:none;font-size:13px;font-weight:600;">Contact Dave →</a>
  </div>

  <p style="font-size:11px;color:#4a5568;margin:24px 0 0;">Darbury Ltd &middot; Engineering Technology Consultancy &middot; darbury.com</p>
</div>`.trim();
}

function daveEmailHtml(
  report: Report,
  answers: AuditAnswers,
  user: { name: string; email: string; company: string; jobTitle: string; phone: string },
  submissionId: string,
  timestamp: string
): string {
  return `
<div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;background:#0a0e14;color:#e8edf4;padding:32px;border-radius:8px;">
  <p style="font-size:11px;color:#3eb8a0;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 4px;">Darbury AI Lab · Lab 3</p>
  <h1 style="font-size:22px;margin:0 0 24px;color:#e8edf4;">New Automation Finder Submission</h1>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;text-decoration:none;">${user.name}</a></td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Company</td><td style="padding:6px 0;font-size:13px;">${user.company}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Job Title</td><td style="padding:6px 0;font-size:13px;">${user.jobTitle}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Phone</td><td style="padding:6px 0;font-size:13px;">${user.phone}</td></tr>
    <tr><td style="padding:6px 0;color:#8a9bb0;font-size:13px;">Email</td><td style="padding:6px 0;font-size:13px;"><a href="mailto:${user.email}" style="color:#3eb8a0;">${user.email}</a></td></tr>
  </table>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;">Questionnaire Answers</p>
  <div style="background:#111820;border:1px solid #1e2d3d;border-radius:6px;padding:20px;margin-bottom:24px;">
    <p style="font-size:11px;color:#8a9bb0;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Q1 — Tools used daily</p>
    <p style="font-size:13px;color:#e8edf4;margin:0 0 16px;">${answers.q1_toolstack}</p>

    <p style="font-size:11px;color:#8a9bb0;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Q2 — Biggest time losses</p>
    <p style="font-size:13px;color:#e8edf4;margin:0 0 16px;">${answers.q2_timeLoss.join("<br/>")}</p>

    <p style="font-size:11px;color:#8a9bb0;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Q3 — Current automation</p>
    <p style="font-size:13px;color:#e8edf4;margin:0 0 4px;">${answers.q3_currentAutomation}</p>
    ${answers.q3_automationDetail ? `<p style="font-size:12px;color:#8a9bb0;margin:0 0 16px;font-style:italic;">${answers.q3_automationDetail}</p>` : '<div style="margin-bottom:16px;"></div>'}

    <p style="font-size:11px;color:#8a9bb0;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Q4 — What success looks like</p>
    <p style="font-size:13px;color:#e8edf4;margin:0 0 16px;">${answers.q4_successCriteria}</p>

    <p style="font-size:11px;color:#8a9bb0;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Q5 — Biggest barriers <span style="color:#3eb8a0;">(address this in your reply)</span></p>
    <p style="font-size:13px;color:#e8edf4;margin:0;">${answers.q5_barriers.join("<br/>")}</p>
  </div>

  <p style="font-size:12px;color:#3eb8a0;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;">Generated Report</p>
  <div style="background:#111820;border:1px solid #1e2d3d;border-radius:6px;padding:20px;margin-bottom:24px;">
    <h2 style="font-size:16px;color:#e8edf4;margin:0 0 4px;">${report.reportTitle}</h2>
    <p style="font-size:13px;color:#8a9bb0;margin:0 0 16px;">${report.intro}</p>
    ${report.opportunities.map((o, i) => oppHtml(o, i + 1)).join("")}
    <p style="font-size:13px;color:#c8d3e0;line-height:1.6;margin:16px 0 0;">${report.closing}</p>
  </div>

  <p style="font-size:11px;color:#4a5568;margin:0;">Submission ID: ${submissionId} &middot; ${timestamp}</p>
</div>`.trim();
}

// ─── Route handler ────────────────────────────────────────────────────────────

function sanitise(s: unknown, maxLen = 300): string {
  if (typeof s !== "string") return "";
  return s.replace(/<[^>]*>/g, "").slice(0, maxLen).trim();
}

function sanitiseArr(arr: unknown, maxItems = 5, maxLen = 150): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .slice(0, maxItems)
    .map((item) => sanitise(item, maxLen))
    .filter(Boolean);
}

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
    const usageCount = await getUsageCount(user.email, "audit");
    if (usageCount >= DAILY_CAP) {
      return NextResponse.json({ error: "limit_reached" }, { status: 429 });
    }

    // 3. Parse and sanitise input
    const body = await req.json();
    const answers: AuditAnswers = {
      q1_toolstack: sanitise(body.q1_toolstack),
      q2_timeLoss: sanitiseArr(body.q2_timeLoss),
      q3_currentAutomation: sanitise(body.q3_currentAutomation, 100),
      q3_automationDetail: sanitise(body.q3_automationDetail),
      q4_successCriteria: sanitise(body.q4_successCriteria),
      q5_barriers: sanitiseArr(body.q5_barriers, 2, 100),
    };

    if (!answers.q1_toolstack || !answers.q3_currentAutomation || !answers.q4_successCriteria) {
      return NextResponse.json({ error: "Incomplete answers" }, { status: 400 });
    }

    // 4. Generate report via Haiku (with one retry on malformed JSON)
    const prompt = buildPrompt(answers, user.name, user.company);
    const { report, raw } = await generateReport(prompt);

    // 5. Increment usage counter
    await incrementUsage(user.email, "audit");

    // 6. Log to Firestore
    let submissionId = "";
    try {
      const db = getDb();
      const docRef = await db.collection("lab_submissions").add({
        lab: "automation-finder",
        timestamp: FieldValue.serverTimestamp(),
        user: {
          name: user.name,
          email: user.email,
          company: user.company,
          jobTitle: user.jobTitle,
          phone: user.phone,
        },
        input: answers,
        output: {
          reportTitle: report.reportTitle,
          intro: report.intro,
          opportunities: report.opportunities,
          closing: report.closing,
          rawHaikuResponse: raw,
        },
        emailSentToVisitor: false, // updated after send
        daveReviewed: false,
        daveNotes: "",
      });
      submissionId = docRef.id;
      console.log("[lab/audit] Firestore write success", user.email, submissionId);
    } catch (e) {
      console.error("[lab/audit] Firestore write failed:", e);
    }

    const date = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timestamp = new Date().toUTCString();

    // 7. Email report to visitor
    let visitorEmailSent = false;
    try {
      await getResend().emails.send({
        from: process.env.RESEND_FROM ?? "AILab@darbury.com",
        to: user.email,
        subject: `Your Automation Opportunities Report — Darbury AI Lab`,
        html: visitorEmailHtml(report, user, date),
      });
      visitorEmailSent = true;

      // Update Firestore flag
      if (submissionId) {
        const db = getDb();
        await db
          .collection("lab_submissions")
          .doc(submissionId)
          .update({ emailSentToVisitor: true });
      }
    } catch (e) {
      console.error("[lab/audit] Visitor email failed:", e);
    }

    // 8. Notify Dave
    try {
      const daveEmail = process.env.DAVE_EMAIL;
      if (daveEmail) {
        await getResend().emails.send({
          from: process.env.RESEND_FROM ?? "AILab@darbury.com",
          to: daveEmail,
          subject: `[Lab 3 Lead] ${user.name} — ${user.company} — Automation Finder`,
          html: daveEmailHtml(report, answers, user, submissionId, timestamp),
        });
      }
    } catch (e) {
      console.error("[lab/audit] Dave notification failed:", e);
    }

    return NextResponse.json({
      report,
      submissionId,
      userName: user.name,
      userCompany: user.company,
      userEmail: user.email,
      visitorEmailSent,
      date,
    });
  } catch (err) {
    console.error("[lab/audit]", err);
    return NextResponse.json({ error: "Report generation unavailable" }, { status: 500 });
  }
}
