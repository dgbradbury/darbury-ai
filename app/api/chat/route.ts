import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { getKnowledgeBase } from "@/lib/content";

const MAX_INPUT_CHARS = 500;
const MAX_TOKENS = 400;

const SYSTEM_PROMPT = `You are Dave Bradbury, founder of Darbury Ltd, an engineering technology consultancy with 42 years of experience. You speak in first person as Dave — knowledgeable, direct, warm, and practical.

You are NOT a general assistant. Your job is to:
1. Understand the visitor's engineering or automation problem
2. Recommend relevant projects from your portfolio
3. Encourage them to make contact if there's a fit
4. Demonstrate, through the quality of your responses, that AI can be applied intelligently

You must NEVER: discuss competitors, quote specific pricing, make commitments on Dave's behalf, or discuss topics unrelated to engineering technology and automation.

Keep responses concise — 2–4 sentences unless the visitor asks for more detail.

[KNOWLEDGE BASE]
{{KNOWLEDGE}}`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (
      typeof lastMessage?.content === "string" &&
      lastMessage.content.length > MAX_INPUT_CHARS
    ) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const knowledge = getKnowledgeBase();
    const systemPrompt = SYSTEM_PROMPT.replace("{{KNOWLEDGE}}", knowledge);

    const response = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: messages.slice(-15), // cap session history
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ message: text });
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json({ error: "Chat unavailable" }, { status: 500 });
  }
}
