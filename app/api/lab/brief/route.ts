import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";

const SYSTEM = `You are an expert engineering automation consultant. Analyse the engineering problem or workflow described and return a JSON object with these keys:
- approach: string — the likely automation/AI approach (1–2 sentences)
- timeSaving: string — estimated time saving (e.g. "60–70% reduction in manual effort")
- toolchain: string[] — 3–5 suggested tools or technologies
- narrative: string — a one-paragraph "what Dave would do" response, written in first person as Dave Bradbury

Return only valid JSON, no markdown fences.`;

export async function POST(req: NextRequest) {
  try {
    const { brief } = await req.json();
    if (!brief || typeof brief !== "string" || brief.length > 1000) {
      return NextResponse.json({ error: "Invalid brief" }, { status: 400 });
    }

    const response = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 600,
      system: SYSTEM,
      messages: [{ role: "user", content: brief }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "{}";
    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/lab/brief]", err);
    return NextResponse.json({ error: "Analysis unavailable" }, { status: 500 });
  }
}
