"use client";

// ChatWidget — floating toggle + panel shell
// Mounts once in app/layout.tsx at root level, persists across all routes.
// Toggle pill: Teal #189B93, hover #147A73, Ink #191D23 text

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatPanel from "./ChatPanel";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // z-50 keeps the widget above page content; bottom-6 right-6 is the standard
    // fixed position — adjust if an existing fixed element conflicts.
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            // Clamp panel height on very small viewports
            className="max-h-[calc(100dvh-6rem)]"
          >
            <ChatPanel onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle button ── */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        aria-label={isOpen ? "Close chat" : "Chat with Dave"}
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-full px-4 py-3
                   text-sm font-semibold shadow-lg transition-colors"
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          backgroundColor: isOpen ? "#147A73" : "#189B93",
          color: "#191D23",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#147A73")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = isOpen
            ? "#147A73"
            : "#189B93")
        }
      >
        {/*
          Replace this span with the Darbury Eye of Ra SVG mark (white, 16×16px)
          when the asset is available.
        */}
        <span className="text-base leading-none" aria-hidden="true">
          ◎
        </span>
        <span>{isOpen ? "Close" : "Ask Dave"}</span>
      </motion.button>
    </div>
  );
}
