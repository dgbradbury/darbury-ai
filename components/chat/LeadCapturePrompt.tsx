"use client";

// LeadCapturePrompt — soft email capture at turn 6+
// Card: Dark Teal #334B49 bg | Text: Light Teal #96B1AD
// Yes button: Teal #189B93 | Dismiss: Slate 700 #57707A
// Confirmed state: Success green #5BAD8A
// Posts to existing /api/contact route

import { useState } from "react";

interface LeadCapturePromptProps {
  onCapture: () => void;
  onDismiss: () => void;
}

export default function LeadCapturePrompt({
  onCapture,
  onDismiss,
}: LeadCapturePromptProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit() {
    const trimmed = email.trim();
    if (!trimmed.includes("@") || status !== "idle") return;
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Chat Widget Lead",
          email: trimmed,
          message: `Lead captured via chat widget. Email: ${trimmed}`,
          source: "chat-lead-capture",
        }),
      });

      if (!res.ok) throw new Error("Contact API error");
      setStatus("sent");
      onCapture();
    } catch {
      setStatus("error");
      // Auto-reset so they can retry
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  if (status === "sent") {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          backgroundColor: "#1C3028",
          border: "1px solid #5BAD8A",
          color: "#5BAD8A",
          fontFamily: "var(--font-inter), Inter, sans-serif",
        }}
      >
        Done — I&apos;ll be in touch.
      </div>
    );
  }

  return (
    <div
      className="rounded-xl px-4 py-3 space-y-2.5"
      style={{
        backgroundColor: "#233B38",
        border: "1px solid #334B49",
        fontFamily: "var(--font-inter), Inter, sans-serif",
      }}
    >
      <p className="text-xs leading-relaxed" style={{ color: "#96B1AD" }}>
        Sounds like there might be something here. Want me to drop you a note
        so we can continue this offline?
      </p>
      <div className="flex gap-2 items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="your@email.com"
          className="chat-textarea flex-1 rounded-lg px-2.5 py-1.5 text-xs
                     focus:outline-none transition-colors"
          style={{
            backgroundColor: "#191D23",
            border: "1px solid #334B49",
            color: "#F0F2F3",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={status === "sending"}
          className="text-xs px-3 py-1.5 rounded-lg font-semibold
                     transition-colors disabled:opacity-50 shrink-0"
          style={{ backgroundColor: "#189B93", color: "#191D23" }}
        >
          {status === "sending" ? "..." : "Yes"}
        </button>
        <button
          onClick={onDismiss}
          className="text-xs transition-colors shrink-0"
          style={{ color: "#57707A" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "#F0F2F3")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "#57707A")
          }
        >
          Not yet
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs" style={{ color: "#C94040" }}>
          Couldn&apos;t send — please try the contact form.
        </p>
      )}
    </div>
  );
}
