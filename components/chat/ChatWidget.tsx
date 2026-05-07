"use client";

// ChatWidget — floating toggle + panel shell
// Mounts once in app/layout.tsx at root level, persists across all routes.
// Toggle pill: Teal #189B93, hover #147A73, Ink #191D23 text
//
// Access gate: checks GET /api/auth/session before opening the chat panel.
// Valid 24-hr session → open ChatPanel
// No session / expired → show GateCard directing user to /lab to register

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import ChatPanel from "./ChatPanel";

type WidgetState = "closed" | "checking" | "open" | "gated";



export default function ChatWidget() {
  const [state, setState] = useState<WidgetState>("closed");

  async function handleToggle() {
    // Close if already open or gated
    if (state === "open" || state === "gated") {
      setState("closed");
      return;
    }

    // Check session before opening
    setState("checking");
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      setState(res.ok ? "open" : "gated");
    } catch {
      // Network error — fail open so the chat is still usable
      setState("open");
    }
  }

  const isExpanded = state === "open" || state === "gated";
  const buttonLabel =
    state === "checking" ? "Checking…" :
    isExpanded           ? "Close"     : "Ask Dave";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Panel / Gate card ── */}
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

        {state === "gated" && (
          <motion.div
            key="gate-card"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <GateCard onClose={() => setState("closed")} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle button ── */}
      <motion.button
        onClick={handleToggle}
        disabled={state === "checking"}
        whileHover={{ scale: state === "checking" ? 1 : 1.05 }}
        whileTap={{ scale: state === "checking" ? 1 : 0.96 }}
        aria-label={isExpanded ? "Close chat" : "Chat with Dave"}
        aria-expanded={isExpanded}
        className="flex items-center gap-2 rounded-full px-4 py-3
                   text-sm font-semibold shadow-lg transition-colors
                   disabled:opacity-70 disabled:cursor-wait"
        style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          backgroundColor: isExpanded ? "#147A73" : "#189B93",
          color: "#191D23",
        }}
        onMouseEnter={(e) => {
          if (state !== "checking")
            e.currentTarget.style.backgroundColor = "#147A73";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor =
            isExpanded ? "#147A73" : "#189B93";
        }}
      >
        {state === "checking" ? (
          /* Spinner while session check is in flight */
          <span
            className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Image
            src="/darbury-logo.png"
            alt="Darbury"
            width={55}
            height={16}
            className="h-4 w-auto object-contain"
            style={{ filter: "brightness(0)" }}
            aria-hidden="true"
          />
        )}
        <span>{buttonLabel}</span>
      </motion.button>
    </div>
  );
}

/* ── Gate card ─────────────────────────────────────────────────────────────
   Shown when the user has no active 24-hr session.
   Matches the ChatPanel header style for visual consistency.
   ──────────────────────────────────────────────────────────────────────── */
function GateCard({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="w-[320px] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
      style={{ backgroundColor: "#191D23", border: "1px solid #334B49" }}
    >
      {/* Header — identical to ChatPanel */}
      <div
        className="flex items-center justify-between px-4 py-3"
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
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-lg leading-none transition-colors"
          style={{ color: "#57707A" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F2F3")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#57707A")}
        >
          ✕
        </button>
      </div>

      {/* Message body */}
      <div className="px-5 py-5 space-y-4">
        <p
          className="text-sm leading-relaxed"
          style={{
            color: "#F0F2F3",
            fontFamily: "var(--font-inter), Inter, sans-serif",
          }}
        >
          To chat with Dave you&apos;ll need a free{" "}
          <strong style={{ color: "#96B1AD" }}>24-hour access pass</strong>.
          It takes under a minute — just register your email on the AI&nbsp;Tools page.
        </p>

        <Link
          href="/lab"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full rounded-xl
                     px-4 py-2.5 text-sm font-semibold transition-colors"
          style={{
            backgroundColor: "#189B93",
            color: "#191D23",
            fontFamily: "var(--font-inter), Inter, sans-serif",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#147A73")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#189B93")
          }
        >
          Get Access — AI Tools →
        </Link>

        <p
          className="text-xs text-center"
          style={{
            color: "#57707A",
            fontFamily: "var(--font-inter), Inter, sans-serif",
          }}
        >
          Already registered?{" "}
          <Link
            href="/lab"
            onClick={onClose}
            className="underline transition-colors"
            style={{ color: "#96B1AD" }}
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
