"use client";

// Three steps joined by a pipe that fills with teal as you scroll past. Each
// step's node lights when the fill reaches it. Reduced motion: shown full.

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";

const STEPS = [
  { title: "Your drawings go in.", body: "PDFs, scans, isometrics, a Plant 3D model." },
  { title: "AI does the reading.", body: "Tags, lines, equipment & quantities come out as a table." },
  {
    title: "An engineer signs it off.",
    body: "Nothing is changed in your model. Results come back for a person to review.",
  },
];

export default function HowIWork() {
  const ref = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.5"] });
  const [lit, setLit] = useState(0);
  // Step 1 lights as the fill starts, the rest as it reaches them.
  useMotionValueEvent(scrollYProgress, "change", (p) => setLit(p <= 0 ? 0 : Math.floor(p * (STEPS.length - 1)) + 1));
  const shown = reduceMotion ? STEPS.length : lit;

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto w-full">
      <p className="font-mono text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-3">
        How I work
      </p>
      <h2 className="font-display font-bold text-4xl md:text-5xl uppercase tracking-tight text-[var(--text-primary)] mb-12">
        Drawings In. Checked Data Out.
      </h2>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 items-start">
        <ol ref={ref} className="relative">
          {/* Pipe: dim track with a teal fill driven by scroll */}
          <span className="absolute left-[15px] top-4 bottom-4 w-[3px] rounded-full bg-[var(--border)]" aria-hidden="true" />
          <motion.span
            className="absolute left-[15px] top-4 bottom-4 w-[3px] rounded-full bg-[var(--accent-teal)] origin-top"
            style={{ scaleY: reduceMotion ? 1 : scrollYProgress }}
            aria-hidden="true"
          />
          {STEPS.map((s, i) => {
            const on = i < shown;
            return (
              <li key={s.title} className="relative pl-16 pb-12 last:pb-0">
                <span
                  className={`absolute left-0 top-0 w-[33px] h-[33px] rounded-full border-2 flex items-center justify-center font-mono text-xs transition-colors duration-300 ${
                    on
                      ? "border-[var(--accent-teal)] bg-[var(--accent-teal)] text-[var(--bg-primary)]"
                      : "border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-muted)]"
                  }`}
                >
                  {i + 1}
                </span>
                <h3
                  className={`font-display font-semibold text-2xl uppercase tracking-wide mb-1 transition-colors duration-300 ${
                    on ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {s.title}
                </h3>
                <p className="text-[var(--text-secondary)]">{s.body}</p>
              </li>
            );
          })}
        </ol>

        <aside className="bg-[var(--bg-surface)] border border-[var(--border)] border-t-4 border-t-[var(--accent-teal)] rounded-lg p-8">
          <p className="font-mono text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
            Your data
          </p>
          <h3 className="font-display font-bold text-2xl uppercase tracking-wide text-[var(--text-primary)] mb-3">
            Data can&apos;t leave the building?
          </h3>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
            Where your IT policy rules out the cloud, I build the same routine to run locally on your
            own hardware.
          </p>
          <Link href="/lab/ai-advisor" className="text-sm text-[var(--accent-teal)] font-display uppercase tracking-wider hover:underline">
            Cloud or local? Ask the advisor →
          </Link>
        </aside>
      </div>
    </section>
  );
}
