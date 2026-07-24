"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

type ScorerState = "idle" | "submitting" | "success" | "limit_reached" | "error";

// Keep value keys in sync with /api/lab/readiness/route.ts
const CENTRAL_OPTIONS = [
  { value: "scattered", label: "Scattered across drives, inboxes & people" },
  { value: "shared", label: "Shared drive / SharePoint, loosely organised" },
  { value: "system", label: "In a managed system (EDMS, register, CMMS)" },
  { value: "integrated", label: "Integrated, single source of truth" },
];
const FORMAT_OPTIONS = [
  { value: "paper", label: "Mostly paper, scans & PDFs" },
  { value: "office", label: "Spreadsheets & office documents" },
  { value: "cad", label: "Native CAD / drawings" },
  { value: "structured", label: "Structured data / tag-referenced databases" },
];
const LIVE_OPTIONS = [
  { value: "none", label: "No live data — static records" },
  { value: "some", label: "Some live feeds, not linked to records" },
  { value: "linked", label: "Live data linked to assets" },
];

const MAX_CHARS = 1200;
const MIN_CHARS = 20;

interface Dimension {
  name: string;
  score: number;
  note: string;
}
interface Stage {
  stage: string;
  title: string;
  actions: string[];
}
interface ReadinessResult {
  score: number;
  band: string;
  summary: string;
  dimensions: Dimension[];
  roadmap: Stage[];
}

const BAND_COLOUR: Record<string, string> = {
  Nascent: "#C94040",
  Developing: "#F0B425",
  Established: "#189B93",
  Advanced: "#5BAD8A",
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

export default function ReadinessScorer() {
  const [state, setState] = useState<ScorerState>("idle");
  const [central, setCentral] = useState(CENTRAL_OPTIONS[0].value);
  const [formats, setFormats] = useState(FORMAT_OPTIONS[0].value);
  const [live, setLive] = useState(LIVE_OPTIONS[0].value);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const locked = state === "submitting" || state === "success";
  const canSubmit = description.trim().length >= MIN_CHARS && state !== "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setState("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/lab/readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ central, formats, live, description }),
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
      console.error("[ReadinessScorer]", err);
      setErrorMessage("Scoring unavailable — please try again in a moment.");
      setState("error");
    }
  }

  function handleReset() {
    setState("idle");
    setDescription("");
    setResult(null);
    setErrorMessage("");
  }

  const bandColour = result ? BAND_COLOUR[result.band] ?? "var(--accent-teal)" : "var(--accent-teal)";

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="How centralised is your asset data?">
            <select value={central} onChange={(e) => setCentral(e.target.value)} disabled={locked} className={selectCls}>
              {CENTRAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Dominant format">
            <select value={formats} onChange={(e) => setFormats(e.target.value)} disabled={locked} className={selectCls}>
              {FORMAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Do you have live data?">
          <select value={live} onChange={(e) => setLive(e.target.value)} disabled={locked} className={selectCls}>
            {LIVE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Describe your current asset data">
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_CHARS))}
              disabled={locked}
              placeholder="What have you got, and where? e.g. 20 years of P&IDs as PDFs, an equipment list in Excel, maintenance history in an ageing CMMS, no tag links between them…"
              rows={5}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-5 py-4 pb-10 text-[var(--text-primary)] text-sm leading-relaxed placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors resize-none disabled:opacity-50"
            />
            <span className="absolute bottom-3 right-4 font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)]">
              {description.length}/{MAX_CHARS}
            </span>
          </div>
        </Field>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          {(state === "idle" || state === "error") && (
            <Button type="submit" disabled={!canSubmit}>
              {state === "error" ? "Try Again →" : "Score My Readiness →"}
            </Button>
          )}
          {state === "submitting" && (
            <Button type="button" disabled>
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Scoring…
              </span>
            </Button>
          )}
          {state === "success" && (
            <Button type="button" variant="outline" onClick={handleReset}>
              Score Again →
            </Button>
          )}
          {state === "idle" && description.length > 0 && description.length < MIN_CHARS && (
            <p className="text-xs text-[var(--text-muted)] font-[var(--font-jetbrains)]">
              {MIN_CHARS - description.length} more characters needed
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
            {/* Score header */}
            <div className="flex items-center gap-6 mb-6">
              <div
                className="shrink-0 w-24 h-24 rounded-full flex flex-col items-center justify-center border-4"
                style={{ borderColor: bandColour }}
              >
                <span className="font-[var(--font-barlow)] font-bold text-3xl text-[var(--text-primary)] leading-none">
                  {result.score}
                </span>
                <span className="font-[var(--font-jetbrains)] text-[10px] text-[var(--text-muted)]">/ 100</span>
              </div>
              <div>
                <span
                  className="inline-block text-xs font-[var(--font-jetbrains)] uppercase tracking-wider rounded-full px-3 py-1 border mb-2"
                  style={{ color: bandColour, borderColor: bandColour }}
                >
                  {result.band}
                </span>
                <p className="text-[var(--text-primary)] leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Dimensions */}
            {result.dimensions.length > 0 && (
              <div className="space-y-3 mb-8">
                {result.dimensions.map((d, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[var(--text-primary)]">{d.name}</span>
                      <span className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)]">{d.score}/100</span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden mb-1">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: "var(--accent-teal)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${d.score}%` }}
                        transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{d.note}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Roadmap */}
            {result.roadmap.length > 0 && (
              <div className="mb-8">
                <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">
                  Staged Roadmap
                </p>
                <div className="space-y-4">
                  {result.roadmap.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                      className="border-l-2 border-[var(--accent-teal)] pl-4"
                    >
                      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-wider mb-1">
                        {s.stage}
                      </p>
                      <p className="text-[var(--text-primary)] font-[var(--font-barlow)] font-semibold text-lg mb-2">
                        {s.title}
                      </p>
                      <ul className="space-y-1">
                        {s.actions.map((a, j) => (
                          <li key={j} className="flex gap-2 text-sm text-[var(--text-secondary)]">
                            <span className="text-[var(--accent-teal)] shrink-0">→</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-sm text-[var(--text-secondary)] flex-1">
                Start small, build on the pockets of data you already have, show what&apos;s
                achievable, then take the next step. That&apos;s exactly how iSiteData rollouts run.
                Dave reviews every submission.
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
              You&apos;ve used your 3 scores for today. Come back tomorrow — or contact Dave to walk
              your roadmap through properly.
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
