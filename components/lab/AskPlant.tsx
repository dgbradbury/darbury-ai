"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

type AskState = "idle" | "submitting" | "success" | "limit_reached" | "error";

interface Row {
  tag: string;
  description: string;
  type: string;
  line: string;
  area: string;
  status: string;
  pidBasis: boolean;
}

interface AskResult {
  answer: string;
  caveat: string;
  rows: Row[];
}

const EXAMPLES = [
  "List all decommissioned pumps on line 200 with no P&ID basis",
  "Which instruments in Unit 10 are operational?",
  "Show every asset with no P&ID basis",
  "What's on line 300 and what's its status?",
];

const STATUS_COLOUR: Record<string, string> = {
  Operational: "#189B93",
  Commissioned: "#334B49",
  Decommissioned: "#864268",
  Maintenance: "#BD759B",
};

export default function AskPlant() {
  const [state, setState] = useState<AskState>("idle");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = question.trim().length >= 4 && state !== "submitting";

  async function ask(q: string) {
    setState("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/lab/ask-plant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
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
      console.error("[AskPlant]", err);
      setErrorMessage("Query unavailable — please try again in a moment.");
      setState("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSubmit) ask(question);
  }

  function runExample(q: string) {
    setQuestion(q);
    ask(q);
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Dataset note */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5 mb-6">
        <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.2em] mb-2">
          Read-only · Sample dataset
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          You&apos;re querying a bundled demo model — 26 assets across three units, with tags,
          lines, status &amp; P&amp;ID basis. Ask in plain English. Nothing is written or changed,
          this is the same read-only, human-sign-off approach PlantMCP takes against a live model.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 300))}
          disabled={state === "submitting"}
          placeholder="Ask the plant a question…"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-5 py-4 text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors disabled:opacity-50"
        />
        <div className="flex flex-wrap items-center gap-4 mt-4">
          {state !== "submitting" && (
            <Button type="submit" disabled={!canSubmit}>
              {state === "error" ? "Try Again →" : "Ask →"}
            </Button>
          )}
          {state === "submitting" && (
            <Button type="button" disabled>
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Reading the model…
              </span>
            </Button>
          )}
          {state === "error" && <p className="text-sm text-red-400">{errorMessage}</p>}
        </div>
      </form>

      {/* Example chips */}
      {(state === "idle" || state === "error") && (
        <div className="flex flex-wrap gap-2 mb-8">
          {EXAMPLES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => runExample(q)}
              className="text-left text-xs text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent-teal)]/50 hover:text-[var(--text-primary)] rounded-full px-3 py-1.5 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

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
            <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">
              Answer · {result.rows.length} {result.rows.length === 1 ? "asset" : "assets"} matched
            </p>
            <p className="text-[var(--text-primary)] leading-relaxed mb-2">{result.answer}</p>
            {result.caveat && (
              <p className="text-sm text-[var(--text-secondary)] italic mb-4">{result.caveat}</p>
            )}

            {result.rows.length > 0 && (
              <div className="overflow-x-auto mt-5 mb-6 border border-[var(--border)] rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left">
                      {["Tag", "Description", "Line", "Status", "P&ID"].map((h) => (
                        <th
                          key={h}
                          className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-wider px-4 py-2.5 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((r) => (
                      <tr key={r.tag} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 py-2.5 font-[var(--font-jetbrains)] text-[var(--accent-teal)] whitespace-nowrap">
                          {r.tag}
                        </td>
                        <td className="px-4 py-2.5 text-[var(--text-secondary)]">{r.description}</td>
                        <td className="px-4 py-2.5 text-[var(--text-secondary)] whitespace-nowrap">{r.line}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span
                            className="text-xs rounded-full px-2 py-0.5 border"
                            style={{
                              color: STATUS_COLOUR[r.status] ?? "var(--text-muted)",
                              borderColor: STATUS_COLOUR[r.status] ?? "var(--border)",
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                          {r.pidBasis ? "Yes" : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-sm text-[var(--text-secondary)] flex-1">
                This ran against a demo model. The same read-only query engine points at your live
                Plant 3D data, with every answer sat behind a human sign-off. Dave reviews every
                query.
              </p>
              <div className="flex gap-3 shrink-0">
                <Button type="button" variant="outline" onClick={() => setState("idle")}>
                  Ask Another →
                </Button>
                <Button href="/contact" variant="ghost">
                  Contact Dave
                </Button>
              </div>
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
              You&apos;ve used your queries for today. Come back tomorrow — or contact Dave to see
              this run live against your own model.
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
