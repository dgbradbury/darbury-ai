"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

type AdvisorState = "idle" | "submitting" | "success" | "limit_reached" | "error";

// Keep value keys in sync with /api/lab/ai-advisor/route.ts
const SENSITIVITY_OPTIONS = [
  { value: "public", label: "Non-sensitive / already public" },
  { value: "commercial", label: "Commercially sensitive, not regulated" },
  { value: "regulated", label: "Regulated / contractually restricted (ITAR, NDA)" },
  { value: "airgapped", label: "Must never leave site / air-gapped" },
];
const VOLUME_OPTIONS = [
  { value: "occasional", label: "Occasional — a few runs a week" },
  { value: "daily", label: "Daily — regular batches" },
  { value: "heavy", label: "Heavy / continuous — many runs a day" },
];
const HARDWARE_OPTIONS = [
  { value: "none", label: "Office laptops only" },
  { value: "workstation", label: "A capable workstation or two" },
  { value: "server", label: "On-prem server or GPU box" },
  { value: "unsure", label: "Not sure what we have" },
];

const MAX_CHARS = 1200;
const MIN_CHARS = 20;

interface AdvisorResult {
  recommendation: string;
  headline: string;
  model: string;
  hardware: string;
  reasoning: string[];
  caveat: string;
}

const REC_COLOUR: Record<string, string> = {
  "Cloud (Claude)": "#189B93",
  "On-prem (Ollama)": "#BD759B",
  Hybrid: "#F0B425",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2 block">
        {label}
      </span>
      {children}
    </label>
  );
}

const selectCls =
  "w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-5 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-teal)] transition-colors disabled:opacity-50";

export default function AiAdvisor() {
  const [state, setState] = useState<AdvisorState>("idle");
  const [sensitivity, setSensitivity] = useState(SENSITIVITY_OPTIONS[0].value);
  const [volume, setVolume] = useState(VOLUME_OPTIONS[0].value);
  const [hardware, setHardware] = useState(HARDWARE_OPTIONS[0].value);
  const [workflow, setWorkflow] = useState("");
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const locked = state === "submitting" || state === "success";
  const canSubmit = workflow.trim().length >= MIN_CHARS && state !== "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setState("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/lab/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sensitivity, volume, hardware, workflow }),
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
      console.error("[AiAdvisor]", err);
      setErrorMessage("Recommendation unavailable — please try again in a moment.");
      setState("error");
    }
  }

  function handleReset() {
    setState("idle");
    setWorkflow("");
    setResult(null);
    setErrorMessage("");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-8">
        <Field label="How sensitive is the data?">
          <select value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} disabled={locked} className={selectCls}>
            {SENSITIVITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <Field label="What's the workflow?">
          <div className="relative">
            <textarea
              value={workflow}
              onChange={(e) => setWorkflow(e.target.value.slice(0, MAX_CHARS))}
              disabled={locked}
              placeholder="Describe what you want AI to do. e.g. Extract tags & lines from scanned P&IDs, then summarise change notes for handover packs…"
              rows={5}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-5 py-4 pb-10 text-[var(--text-primary)] text-sm leading-relaxed placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors resize-none disabled:opacity-50"
            />
            <span className="absolute bottom-3 right-4 font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)]">
              {workflow.length}/{MAX_CHARS}
            </span>
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Expected volume">
            <select value={volume} onChange={(e) => setVolume(e.target.value)} disabled={locked} className={selectCls}>
              {VOLUME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Current hardware">
            <select value={hardware} onChange={(e) => setHardware(e.target.value)} disabled={locked} className={selectCls}>
              {HARDWARE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          {(state === "idle" || state === "error") && (
            <Button type="submit" disabled={!canSubmit}>
              {state === "error" ? "Try Again →" : "Get My Recommendation →"}
            </Button>
          )}
          {state === "submitting" && (
            <Button type="button" disabled>
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Weighing it up…
              </span>
            </Button>
          )}
          {state === "success" && (
            <Button type="button" variant="outline" onClick={handleReset}>
              Start Over →
            </Button>
          )}
          {state === "idle" && workflow.length > 0 && workflow.length < MIN_CHARS && (
            <p className="text-xs text-[var(--text-muted)] font-[var(--font-jetbrains)]">
              {MIN_CHARS - workflow.length} more characters needed
            </p>
          )}
          {state === "error" && <p className="text-sm text-red-400">{errorMessage}</p>}
        </div>
      </form>

      <AnimatePresence mode="wait">
        {state === "success" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-8"
          >
            <span
              className="inline-block text-xs font-[var(--font-jetbrains)] uppercase tracking-wider rounded-full px-3 py-1 border mb-4"
              style={{ color: REC_COLOUR[result.recommendation] ?? "var(--accent-teal)", borderColor: REC_COLOUR[result.recommendation] ?? "var(--accent-teal)" }}
            >
              {result.recommendation}
            </span>
            <p className="text-[var(--text-primary)] text-lg leading-relaxed mb-6">{result.headline}</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-[var(--bg-elevated)] rounded-lg px-4 py-3">
                <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.12em] mb-1">Model</p>
                <p className="text-sm text-[var(--text-primary)] leading-snug">{result.model}</p>
              </div>
              <div className="bg-[var(--bg-elevated)] rounded-lg px-4 py-3">
                <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.12em] mb-1">Hardware</p>
                <p className="text-sm text-[var(--text-primary)] leading-snug">{result.hardware}</p>
              </div>
            </div>

            {result.reasoning.length > 0 && (
              <div className="mb-6 space-y-2">
                {result.reasoning.map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-[var(--accent-teal)] shrink-0">→</span>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
            )}

            {result.caveat && (
              <p className="text-sm text-[var(--text-secondary)] italic border-l-2 border-[var(--border)] pl-4 mb-6">
                {result.caveat}
              </p>
            )}

            <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-sm text-[var(--text-secondary)] flex-1">
                This is a first-pass steer. A proper call weighs your exact data, throughput &amp;
                budget — that&apos;s the front door to the Darbury Local product line. Dave reviews
                every submission.
              </p>
              <Button href="/contact" variant="outline" className="shrink-0">
                Contact Dave →
              </Button>
            </div>
          </motion.div>
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
              You&apos;ve used your 3 checks for today. Come back tomorrow — or contact Dave to talk
              through a local-vs-cloud plan properly.
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
