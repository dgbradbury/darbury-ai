"use client";

// ChatWidget — floating toggle + panel shell
// Mounts once in app/layout.tsx at root level, persists across all routes.
// Toggle pill: Teal #189B93, hover #147A73, Ink #191D23 text
// No registration required — chat is open to all visitors.

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import ChatPanel from "./ChatPanel";

type WidgetState = "closed" | "open";

export default function ChatWidget() {
  const [state, setState] = useState<WidgetState>("closed");

  function handleToggle() {
    setState(state === "open" ? "closed" : "open");
  }

  const isExpanded = state === "open";
  const buttonLabel = isExpanded ? "Close" : "Ask Dave";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Panel ── */}
      <AnimatePresence>
        {state === "open" && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="max-h-[calc(100dvh-6rem)]"
          >
            <ChatPanel onClose={() => setState("closed")} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle button ── */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        aria-label={isExpanded ? "Close chat" : "Chat with Dave"}
        aria-expanded={isExpanded}
        className="flex items-center gap-2 rounded-full px-4 py-3
                   text-sm font-semibold shadow-lg transition-colors"
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          backgroundColor: isExpanded ? "#147A73" : "#189B93",
          color: "#191D23",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#147A73";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor =
            isExpanded ? "#147A73" : "#189B93";
        }}
      >
        <Image
          src="/images/darbury-lockup-white.png"
          alt="Darbury"
          width={55}
          height={16}
          className="h-4 w-auto object-contain"
          style={{ filter: "brightness(0)" }}
          aria-hidden="true"
        />
        <span>{buttonLabel}</span>
      </motion.button>
    </div>
  );
}
