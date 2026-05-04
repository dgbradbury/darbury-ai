"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

interface BriefResult {
  automationApproach: string;
  suggestedToolchain: string[];
  narrative: string;
  submissionId: string;
}

export default function BriefResultCard({ result }: { result: BriefResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-8"
    >
      {/* Automation Approach */}
      <section className="mb-7">
        <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">
          Automation Approach
        </p>
        <p className="text-[var(--text-primary)] leading-relaxed">
          {result.automationApproach}
        </p>
      </section>

      {/* Suggested Toolchain */}
      {result.suggestedToolchain.length > 0 && (
        <section className="mb-7">
          <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">
            Suggested Toolchain
          </p>
          <div className="flex flex-wrap gap-2">
            {result.suggestedToolchain.map((tool) => (
              <motion.span
                key={tool}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="px-3 py-1.5 bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 rounded text-xs font-[var(--font-jetbrains)] uppercase tracking-wider"
              >
                {tool}
              </motion.span>
            ))}
          </div>
        </section>
      )}

      {/* Narrative */}
      {result.narrative && (
        <section className="mb-8">
          <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">
            What This Could Look Like
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {result.narrative}
          </p>
        </section>
      )}

      {/* Human-in-the-loop footer */}
      <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-[var(--text-secondary)] flex-1">
          Dave reviews every submission. If there&apos;s a strong fit, he may reach out directly.
        </p>
        <Button href="/contact" variant="outline" className="shrink-0">
          Contact Dave →
        </Button>
      </div>
    </motion.div>
  );
}
