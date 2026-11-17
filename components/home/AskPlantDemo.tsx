"use client";

// "Try it now" band: replays answers the real Ask the Plant tool gave to its
// own example questions. No API call, nothing to abuse, nothing to pay for.
// Rows resolve from the same register the Lab tool queries (lib/ask-plant).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DATASET, STATUS_COLOUR } from "@/lib/ask-plant";

// Saved output from the live tool (same Haiku model, prompt & register as the
// Lab), captured 17 Nov 2026. Q3 is the correct one of four runs.
const SAVED: { question: string; answer: string; caveat: string; matchedTags: string[] }[] = [
  {
    question: "List all decommissioned pumps on line 200 with no P&ID basis",
    answer: "One decommissioned pump on line L-200 has no P&ID basis: P-201 (Transfer pump).",
    caveat: "P-202 is also decommissioned on L-200 but has pidBasis=true, so it does not match the 'no P&ID basis' criterion.",
    matchedTags: ["P-201"],
  },
  {
    question: "Which instruments in Unit 10 are operational?",
    answer: "Four instruments in Unit 10 — Feed are operational: feed flow transmitter (FT-101), feed pressure transmitter (PT-101), pre-heater temperature transmitter (TT-101), and feed tank level transmitter (LT-10).",
    caveat: "Instruments are those with type ending in 'instrument' in area 'Unit 10 — Feed' with status 'Operational'.",
    matchedTags: ["FT-101", "PT-101", "TT-101", "LT-10"],
  },
  {
    question: "What's on line 300 and what's its status?",
    answer: "Line L-300 carries the Product pump (P-301, Operational), Product separator (V-301, Operational), Product cooler (E-301, Maintenance), Product control valve (FV-301, Operational), Separator relief valve (PSV-301, Operational), Product pressure transmitter (PT-301, Maintenance), and all are in Unit 30 — Product.",
    caveat: "E-301 and PT-301 are currently in Maintenance status; the rest are Operational.",
    matchedTags: ["P-301", "V-301", "E-301", "FV-301", "PSV-301", "PT-301"],
  },
];

const TYPE_MS = 700; // whole answer types out in under a second

export default function AskPlantDemo() {
  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLElement>(null);

  // First chip plays by itself when the band scrolls into view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setActive((a) => a ?? 0);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Type the answer out. Reduced motion shows it whole.
  useEffect(() => {
    if (active === null) return;
    const len = SAVED[active].answer.length;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(len);
      return;
    }
    setShown(0);
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const n = Math.min(len, Math.ceil(((t - start) / TYPE_MS) * len));
      setShown(n);
      if (n < len) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const current = active === null ? null : SAVED[active];
  const done = current !== null && shown >= current.answer.length;
  const rows = current ? current.matchedTags.flatMap((t) => DATASET.filter((a) => a.tag === t)) : [];

  return (
    <section ref={ref} className="px-6 py-24 max-w-6xl mx-auto w-full">
      <p className="font-mono text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-3">
        Try it now
      </p>
      <h2 className="font-display font-bold text-4xl md:text-5xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
        Ask a Plant a Question.
      </h2>
      <p className="text-[var(--text-secondary)] max-w-2xl mb-8">
        This is a sample asset register from a Plant 3D model. Pick a question & see what comes
        back, in plain English & as a table.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        {SAVED.map((s, i) => (
          <button
            key={s.question}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={active === i}
            className={`text-left text-sm px-4 py-2.5 rounded-full border transition-colors ${
              active === i
                ? "border-[var(--accent-teal)] bg-[var(--accent-teal)]/10 text-[var(--text-primary)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-teal)]/50 hover:text-[var(--text-primary)]"
            }`}
          >
            {s.question}
          </button>
        ))}
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="p-6 min-h-[7.5rem]" aria-live="polite">
          {current && (
            <>
              <p className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
                Answer
              </p>
              <p className="text-[var(--text-primary)] leading-relaxed">
                {current.answer.slice(0, shown)}
                {!done && <span className="inline-block w-2 h-4 align-middle bg-[var(--accent-teal)] ml-0.5 animate-pulse" />}
              </p>
              {done && current.caveat && (
                <p className="text-sm text-[var(--text-muted)] mt-3">{current.caveat}</p>
              )}
            </>
          )}
        </div>

        {done && rows.length > 0 && (
          <div className="overflow-x-auto border-t border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  {["Tag", "Description", "Line", "Status", "P&ID"].map((h) => (
                    <th key={h} className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider px-6 py-2.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.tag} className="dr-row border-b border-[var(--border)] last:border-0" style={{ "--pid-delay": `${i * 0.06}s` } as React.CSSProperties}>
                    <td className="px-6 py-2.5 font-mono text-[var(--accent-teal)] whitespace-nowrap">{r.tag}</td>
                    <td className="px-6 py-2.5 text-[var(--text-secondary)] whitespace-nowrap">{r.description}</td>
                    <td className="px-6 py-2.5 text-[var(--text-secondary)] whitespace-nowrap">{r.line}</td>
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <span className="text-xs rounded-full px-2 py-0.5 border" style={{ color: STATUS_COLOUR[r.status], borderColor: STATUS_COLOUR[r.status] }}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-2.5 text-[var(--text-secondary)]">{r.pidBasis ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-[var(--border)] px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-sm text-[var(--text-muted)] flex-1">
            Sample plant, saved answers. Ask your own question in the Lab.
          </p>
          <Link
            href="/lab/ask-plant"
            className="inline-flex items-center justify-center px-5 py-2.5 border border-[var(--accent-teal)] text-[var(--accent-teal)] font-display font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal)]/10 transition-colors"
          >
            Ask Your Own →
          </Link>
        </div>
      </div>
    </section>
  );
}
