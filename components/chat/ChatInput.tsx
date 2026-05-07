"use client";

// ChatInput — auto-growing textarea + send button
// Background: Ink #191D23 | Border: Dark Teal #334B49 | Focus: Teal #189B93
// Text: Off-white #F0F2F3 | Placeholder: Slate 700 #57707A (via .chat-textarea in globals.css)
// Send button: Teal #189B93, hover #147A73, Ink icon

import { useState, useRef, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  }

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className="flex items-end gap-2 p-3"
      style={{ borderTop: "1px solid #334B49" }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled}
        placeholder="Describe your problem..."
        maxLength={500}
        rows={1}
        className="chat-textarea flex-1 resize-none rounded-xl px-3 py-2.5 text-sm
                   focus:outline-none transition-colors
                   disabled:opacity-50 max-h-24 overflow-y-auto"
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          backgroundColor: "#191D23",
          border: "1px solid #334B49",
          color: "#F0F2F3",
        }}
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send message"
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                   text-base font-bold transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#189B93", color: "#191D23" }}
        onMouseEnter={(e) => {
          if (canSend) e.currentTarget.style.backgroundColor = "#147A73";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#189B93";
        }}
      >
        ↑
      </button>
    </div>
  );
}
