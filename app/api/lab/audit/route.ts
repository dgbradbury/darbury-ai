import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { getResend, CONTACT_TO, CONTACT_FROM } from "@/lib/resend";

const SYSTEM = `You are an expert engineering automation consultant. Based on the workflow audit answers provided, generate a personalised automation opportunities report. Return a JSON object with:
- summary: string — one-sentence summary of their situation
- opportunities: Array<{ title: string, description: string, impact: string, effort: string }> — exactly 3 opportunities
- nextStep: string — one recommended immediate action

Return only valid JSON, no markdown fences.`;

export async function POST(req: NextRequest) {
  try {
    const { answers, email } = await req.json();

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
    }

    const prompt = Object.entries(answers)
      .map(([q, a]) => `${q}: ${a}`)
      .join("\n");

    const response = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 800,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "{}";
    const result = JSON.parse(text);

    // Optionally email the report to the visitor
    if (email && typeof email === "string" && email.includes("@")) {
      const oppList = result.opportunities
        ?.map(
          (o: { title: string; description: string; impact: string }) =>
            `${o.title}\n${o.description}\nImpact: ${o.impact}`
        )
        .join("\n\n");

      await getResend().emails.send({
        from: CONTACT_FROM,
        to: email,
        replyTo: CONTACT_TO,
        subject: "Your Automation Opportunities Report — Darbury",
        text: `Hi,\n\nHere are your 3 automation opportunities:\n\n${oppList}\n\nNext step: ${result.nextStep}\n\n— Dave Bradbury, Darbury Ltd\ndave@darbury.com`,
      });

      // Forward lead to Dave
      await getResend().emails.send({
        from: CONTACT_FROM,
        to: CONTACT_TO,
        subject: `New audit lead: ${email}`,
        text: `New automation audit completed.\n\nEmail: ${email}\n\nAnswers:\n${prompt}\n\nReport generated: ${JSON.stringify(result, null, 2)}`,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/lab/audit]", err);
    return NextResponse.json({ error: "Audit unavailable" }, { status: 500 });
  }
}
