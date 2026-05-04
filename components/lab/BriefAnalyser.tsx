"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import BriefResultCard from "@/components/lab/BriefResultCard";

type AnalyserState = "idle" | "submitting" | "success" | "limit_reached" | "error";

interface BriefResult {
  automationApproach: string;
  suggestedToolchain: string[];
  narrative: string;
  submissionId: string;
}

const PLACEHOLDER =
  "e.g. We have a team of 12 engineers who spend 3–4 hours a week manually transferring data from AutoCAD drawings into Excel reports. The process is error-prone and we're looking for a way to automate it…";

const MAX_CHARS = 1000;
const MIN_CHARS = 50;

export default function BriefAnalyser() {
  const [state, setState] = useState<AnalyserState>("idle");
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState<BriefResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const charCount = problem.length;
  const canSubmit = charCount >= MIN_CHARS && state !== "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/lab/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem }),
      });

      const data = await res.json();

      if (res.status === 429 || data.error === "limit_reached") {
        setState("limit_reached");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Unknown error");
      }

      setResult(data);
      setState("success");
    } catch (err) {
      console.error("[BriefAnalyser]", err);
      setErrorMessage("Analysis unavailable — please try again in a moment.");
      setState("error");
    }
  }

  function handleReset() {
    setState("idle");
    setProblem("");
    setResult(null);
    setErrorMessage("");
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Input form — hidden once a result is showing */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value.slice(0, MAX_CHARS))}
            disabled={state === "submitting" || state === "success"}
            placeholder={PLACEHOLDER}
            rows={7}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-5 py-4 pb-10 text-[var(--text-primary)] text-sm leading-relaxed placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors resize-none disabled:opacity-50"
          />
          {/* Character counter */}
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

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          {(state === "idle" || state === "error") && (
            <Button type="submit" disabled={!canSubmit}>
              {state === "error" ? "Try Again →" : "Analyse →"}
            </Button>
          )}

          {state === "submitting" && (
            <Button type="button" disabled>
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analysing…
              </span>
            </Button>
          )}

          {state === "success" && (
            <Button type="button" variant="outline" onClick={handleReset}>
              Analyse Another →
            </Button>
          )}

          {/* Inline hints */}
          {state === "idle" && charCount > 0 && charCount < MIN_CHARS && (
            <p className="text-xs text-[var(--text-muted)] font-[var(--font-jetbrains)]">
              {MIN_CHARS - charCount} more {MIN_CHARS - charCount === 1 ? "character" : "characters"} needed
            </p>
          )}

          {state === "error" && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}
        </div>
      </form>

      {/* Result / limit panels */}
      <AnimatePresence mode="wait">
        {state === "success" && result && (
          <BriefResultCard key="result" result={result} />
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
              You&apos;ve used your 3 analyses for today. Come back tomorrow — or contact Dave
              directly if you&apos;d like to discuss your project now.
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
