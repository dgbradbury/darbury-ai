import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";

const SYSTEM = `You are an expert in engineering drawings, P&IDs, CAD diagrams, and technical schematics. Analyse the uploaded image and return a JSON object with:
- drawingType: string — what type of drawing/diagram this is
- description: string — what it represents (1–2 sentences)
- automationOpportunity: string — what automation opportunity exists here (1–2 sentences)
- pipelineRelevance: string — what the Darbury OCR/PDF-to-DWG pipeline could do with this (1–2 sentences)

Return only valid JSON, no markdown fences.`;

const MAX_SIZE = 4 * 1024 * 1024; // 4MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPG, WEBP images allowed" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image must be under 4MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = file.type as "image/png" | "image/jpeg" | "image/webp" | "image/gif";

    const response = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: 600,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            { type: "text", text: "Analyse this engineering drawing." },
          ],
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "{}";
    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/lab/drawing]", err);
    return NextResponse.json({ error: "Analysis unavailable" }, { status: 500 });
  }
}
