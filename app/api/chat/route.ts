import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, HAIKU_MODEL } from "@/lib/anthropic";
import { getKnowledgeBase } from "@/lib/content";
import { checkRateLimit } from "@/lib/rateLimit";
import { getDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const MAX_INPUT_CHARS = 500;
const MAX_TOKENS = 400;
const SESSION_TURN_LIMIT = 15;

const SYSTEM_PROMPT_PREFIX = `You are Dave Bradbury, Managing Director and Owner of Darbury Ltd —
an engineering technology consultancy with 42+ years of experience across construction, oil &
gas, and manufacturing. You speak in first person as Dave.
Your voice is: knowledgeable, direct, warm, and practical. Never corporate. Never salesy.

You have one job: help the person in front of you understand whether Dave can solve their
engineering or automation problem — and if so, encourage them to make contact.

Your approach:
1. Ask what they are working on or trying to fix
2. Listen carefully to the domain (digital twin, CAD, plant, iOS/AR, automation, AI, data, governance)
3. Recommend 1–2 relevant projects or service areas from your portfolio that relate to their problem
4. If there is a genuine fit, suggest they reach out via the contact form or at dave@darbury.com
5. Demonstrate through the quality of your thinking that AI can be applied intelligently

Rules you must never break:
- Never quote specific day rates or project costs (say "I'll give you a clear figure after
  we've talked through the scope")
- Never make commitments on Dave's behalf regarding availability or timelines
- Never discuss competitors or recommend other suppliers
- Never discuss topics unrelated to engineering, technology, automation, information management, or AI
- Never pretend to have capabilities or projects that are not in the knowledge base below
- Keep responses concise — 2–4 short paragraphs maximum. This is a conversation, not a report.
- If asked something outside your knowledge, say so honestly and suggest they ask via contact.

You may use light Markdown in your responses (bold for emphasis, bullet points for lists).
Do not use headers. Do not write walls of text.

---

KNOWLEDGE BASE — your memory about Dave, Darbury, and the portfolio:

{{KNOWLEDGE}}`;

// ---------------------------------------------------------------------------
// Firestore chat logging — anonymous sessions
// Collection: public_chat_sessions/{conversationId}
// ---------------------------------------------------------------------------

interface TurnRecord {
  seq: number;
  userMessage: string;
  assistantMessage: string;
  inputTokens: number;
  outputTokens: number;
  turnCostUSD: number;
  timestamp: Date; // plain Date — FieldValue.serverTimestamp() is not allowed inside arrayUnion
}

async function logChatTurn(
  ip: string,
  conversationId: string,
  turn: TurnRecord,
  isFirst: boolean
): Promise<void> {
  const db = getDb();
  const ref = db.collection("public_chat_sessions").doc(conversationId);

  const always = {
    lastActiveAt: FieldValue.serverTimestamp(),
    turnCount: FieldValue.increment(1),
    totalInputTokens: FieldValue.increment(turn.inputTokens),
    totalOutputTokens: FieldValue.increment(turn.outputTokens),
    estimatedCostUSD: FieldValue.increment(turn.turnCostUSD),
    turns: FieldValue.arrayUnion(turn),
  };

  if (isFirst) {
    await ref.set(
      {
        conversationId,
        ip,
        startedAt: FieldValue.serverTimestamp(),
        ...always,
      },
      { merge: true }
    );
  } else {
    await ref.update(always);
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // --- Rate limiting ---
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed, reason } = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: reason }, { status: 429 });
    }

    const body = await req.json();
    const { messages, turnCount = 0, conversationId } = body;

    // --- Session turn cap ---
    if (turnCount >= SESSION_TURN_LIMIT) {
      return NextResponse.json({
        error: "SESSION_LIMIT",
        message:
          "It looks like we've had a good conversation. Why not reach out directly — dave@darbury.com, or via the contact form.",
      });
    }

    // --- Input validation ---
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Sanitise: enforce max message length per turn (truncate, not reject)
    const sanitisedMessages = messages
      .filter(
        (m) =>
          m &&
          typeof m.role === "string" &&
          typeof m.content === "string" &&
          (m.role === "user" || m.role === "assistant")
      )
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: String(m.content).slice(0, MAX_INPUT_CHARS),
      }))
      // Cap session history to last 15 messages (Haiku context efficiency)
      .slice(-15);

    if (sanitisedMessages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // --- Build system prompt with knowledge base ---
    const knowledge = getKnowledgeBase();
    const systemPrompt = SYSTEM_PROMPT_PREFIX.replace("{{KNOWLEDGE}}", knowledge);

    // --- Call Haiku ---
    const response = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: sanitisedMessages,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Anthropic");
    }

    // --- Log turn to Firestore ---
    if (conversationId && typeof conversationId === "string") {
      const { input_tokens, output_tokens } = response.usage;
      // Haiku pricing as at May 2026: $0.80/M input, $4.00/M output
      const turnCostUSD =
        (input_tokens / 1_000_000) * 0.8 +
        (output_tokens / 1_000_000) * 4.0;

      const turn: TurnRecord = {
        seq: turnCount + 1,
        userMessage: sanitisedMessages.at(-1)!.content,
        assistantMessage: content.text,
        inputTokens: input_tokens,
        outputTokens: output_tokens,
        turnCostUSD,
        timestamp: new Date(),
      };

      try {
        await logChatTurn(ip, conversationId, turn, turnCount === 0);
        console.log("[/api/chat] Firestore write success", conversationId);
      } catch (err) {
        console.error("[/api/chat] Firestore write failed:", err);
      }
    }

    return NextResponse.json({
      message: content.text,
      turnCount: turnCount + 1,
    });
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try the contact form if this persists." },
      { status: 500 }
    );
  }
}
