"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import ComplianceResultCard, { Gap } from "@/components/lab/ComplianceResultCard";

type CheckerState = "idle" | "submitting" | "success" | "limit_reached" | "error";

// Keep the value keys in sync with STANDARDS in /api/lab/compliance/route.ts
const STANDARD_OPTIONS = [
  { value: "iso-19650", label: "ISO 19650 — information management" },
  { value: "tag-numbering", label: "Tag numbering conventions (KKS / plant tags)" },
  { value: "equipment-naming", label: "Equipment & line naming rules" },
  { value: "isa-5.1", label: "ISA-5.1 instrumentation identification" },
  { value: "general", label: "General documentation & data-quality best practice" },
];

const PLACEHOLDER =
  "Paste an engineering spec, work instruction, tag list, or naming schema here. e.g.\nP101 — main feed pump\nP102 pump (standby)\nTK-1 storage tank\nFT200 flow tx on 6\" line…";

const MAX_CHARS = 4000;
const MIN_CHARS = 30;

interface ComplianceResult {
  overallAssessment: string;
  gaps: Gap[];
  standardLabel: string;
}

export default function ComplianceChecker() {
  const [state, setState] = useState<CheckerState>("idle");
  const [text, setText] = useState("");
  const [standard, setStandard] = useState(STANDARD_OPTIONS[0].value);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const charCount = text.length;
  const canSubmit = charCount >= MIN_CHARS && state !== "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/lab/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, standard }),
      });

      const data = await res.json();

      if (res.status === 429 || data.error === "limit_reached") {
        setState("limit_reached");
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Unknown error");

      setResult(data);
      setState("success");
    } catch (err) {
      console.error("[ComplianceChecker]", err);
      setErrorMessage("Assessment unavailable — please try again in a moment.");
      setState("error");
    }
  }

  function handleReset() {
    setState("idle");
    setText("");
    setResult(null);
    setErrorMessage("");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-8">
        {/* Standard selector */}
        <label className="block mb-4">
          <span className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2 block">
            Check against
          </span>
          <select
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            disabled={state === "submitting" || state === "success"}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-5 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-teal)] transition-colors disabled:opacity-50"
          >
            {STANDARD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {/* Text input */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            disabled={state === "submitting" || state === "success"}
            placeholder={PLACEHOLDER}
            rows={9}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-5 py-4 pb-10 text-[var(--text-primary)] text-sm leading-relaxed placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors resize-none disabled:opacity-50"
          />
          <span
            className={`absolute bottom-3 right-4 font-[var(--font-jetbrains)] text-xs transition-colors ${
              charCount >= MAX_CHARS
                ? "text-amber-400"
                : charCount >= MAX_CHARS * 0.9
                ? "text-[var(--text-secondary)]"
                : "text-[var(--text-muted)]"
            }`}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          {(state === "idle" || state === "error") && (
            <Button type="submit" disabled={!canSubmit}>
              {state === "error" ? "Try Again →" : "Check Gaps →"}
            </Button>
          )}

          {state === "submitting" && (
            <Button type="button" disabled>
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Checking…
              </span>
            </Button>
          )}

          {state === "success" && (
            <Button type="button" variant="outline" onClick={handleReset}>
              Check Another →
            </Button>
          )}

          {state === "idle" && charCount > 0 && charCount < MIN_CHARS && (
            <p className="text-xs text-[var(--text-muted)] font-[var(--font-jetbrains)]">
              {MIN_CHARS - charCount} more {MIN_CHARS - charCount === 1 ? "character" : "characters"} needed
            </p>
          )}

          {state === "error" && <p className="text-sm text-red-400">{errorMessage}</p>}
        </div>
      </form>

      <AnimatePresence mode="wait">
        {state === "success" && result && (
          <ComplianceResultCard
            key="result"
            overallAssessment={result.overallAssessment}
            gaps={result.gaps}
            standardLabel={result.standardLabel}
          />
        )}

        {state === "limit_reached" && (
          <motion.div
            key="limit"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-[var(--bg-surface)] border border-amber-800/50 rounded-lg p-10 text-center"
          >
            <p className="font-[var(--font-jetbrains)] text-xs text-amber-400 uppercase tracking-[0.2em] mb-3">
              Daily Limit Reached
            </p>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              You&apos;ve used your 3 checks for today. Come back tomorrow — or contact Dave
              directly to discuss a full governance review now.
            </p>
            <Button href="/contact" variant="outline">
              Contact Dave →
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
