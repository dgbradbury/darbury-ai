"use client";

// ChatPanel — the expanded chat window
// Shell: Ink #191D23 | Border: Dark Teal #334B49
// Header name: Barlow Condensed Bold, Off-white #F0F2F3
// Sub-label: Barlow Condensed, Slate 500 #78919E, uppercase
// Lead capture fires at turn LEAD_CAPTURE_TURN

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import LeadCapturePrompt from "./LeadCapturePrompt";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi — I'm Dave. Multiple decades of solving engineering problems with technology. Tell me what you're working on, or what's giving you grief and I'll tell you honestly if I can help.",
};

const LEAD_CAPTURE_TURN = 6;

interface ChatPanelProps {
  onClose: () => void;
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  // Stable ID for the lifetime of this widget open — new mount = new conversation
  const conversationId = useRef(crypto.randomUUID()).current;

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [turnCount, setTurnCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, showLeadCapture]);

  async function handleSend(input: string) {
    if (!input.trim() || isLoading) return;
    setError(null);

    const userMessage: Message = { role: "user", content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    // Show lead capture at the right turn (once only, if not already captured)
    if (turnCount + 1 >= LEAD_CAPTURE_TURN && !leadCaptured && !showLeadCapture) {
      setShowLeadCapture(true);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          turnCount,
          conversationId,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setError("Your access session has expired. Please re-verify at the AI Tools page.");
        return;
      }

      if (res.status === 429) {
        setError(data.error ?? "Too many messages — please try again later.");
        return;
      }

      if (!res.ok) {
        setError(
          data.error ??
            "Something went wrong — please try again or use the contact form."
        );
        return;
      }

      // Session limit reached — show Dave's sign-off message
      if (data.error === "SESSION_LIMIT") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
      setTurnCount(data.turnCount ?? turnCount + 1);
    } catch {
      setError("Connection error — please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="w-[360px] sm:w-[400px] h-[520px] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
      style={{ backgroundColor: "#191D23", border: "1px solid #334B49" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid #334B49" }}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/darbury-logo.png"
            alt="Darbury"
            width={96}
            height={28}
            className="h-7 w-auto object-contain"
            priority
          />
          <div>
            <p
              className="text-sm font-bold leading-tight"
              style={{
                fontFamily: "var(--font-barlow), 'Barlow Condensed', sans-serif",
                color: "#F0F2F3",
              }}
            >
              Dave Bradbury
            </p>
            <p
              className="uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-barlow), 'Barlow Condensed', sans-serif",
                color: "#78919E",
                fontSize: "0.6rem",
              }}
            >
              Darbury Ltd
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close chat"
          className="text-lg leading-none transition-colors"
          style={{ color: "#57707A" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F2F3")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#57707A")}
        >
          ✕
        </button>
      </div>

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}

        {isLoading && <ChatMessage role="assistant" content="" isTyping />}

        {showLeadCapture && !leadCaptured && (
          <LeadCapturePrompt
            onCapture={() => {
              setLeadCaptured(true);
              setShowLeadCapture(false);
            }}
            onDismiss={() => setShowLeadCapture(false)}
          />
        )}

        {error && (
          <p
            className="text-xs text-center px-2"
            style={{
              color: "#C94040",
              fontFamily: "var(--font-inter), Inter, sans-serif",
            }}
          >
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
