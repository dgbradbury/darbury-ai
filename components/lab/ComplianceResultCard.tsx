"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export interface Gap {
  severity: string;
  area: string;
  finding: string;
  recommendation: string;
}

interface ComplianceResultCardProps {
  overallAssessment: string;
  gaps: Gap[];
  standardLabel: string;
}

const SEVERITY: Record<string, { colour: string; label: string }> = {
  High: { colour: "#C94040", label: "High" },
  Medium: { colour: "#F0B425", label: "Medium" },
  Low: { colour: "#5BAD8A", label: "Low" },
};

export default function ComplianceResultCard({
  overallAssessment,
  gaps,
  standardLabel,
}: ComplianceResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-8"
    >
      {/* Standard + overall */}
      <section className="mb-7">
        <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">
          Checked Against · {gaps.length} {gaps.length === 1 ? "gap" : "gaps"}
        </p>
        <p className="text-[var(--accent-teal)] text-sm font-[var(--font-jetbrains)] mb-4">
          {standardLabel}
        </p>
        <p className="text-[var(--text-primary)] leading-relaxed">{overallAssessment}</p>
      </section>

      {/* Gaps */}
      {gaps.length > 0 ? (
        <section className="mb-8 space-y-4">
          {gaps.map((g, i) => {
            const sev = SEVERITY[g.severity] ?? { colour: "var(--text-muted)", label: g.severity };
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="border-l-2 pl-4 py-1"
                style={{ borderColor: sev.colour }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="text-xs font-[var(--font-jetbrains)] uppercase tracking-wider"
                    style={{ color: sev.colour }}
                  >
                    {sev.label}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                    {g.area}
                  </span>
                </div>
                <p className="text-[var(--text-primary)] leading-relaxed mb-1">{g.finding}</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  → {g.recommendation}
                </p>
              </motion.div>
            );
          })}
        </section>
      ) : (
        <p className="text-[var(--text-secondary)] mb-8">
          Nothing flagged against this standard from the text supplied.
        </p>
      )}

      {/* Human-in-the-loop footer */}
      <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-[var(--text-secondary)] flex-1">
          This is a fast first pass on the text you pasted. A full governance review works from
          your live documents and naming schema. Dave reviews every submission.
        </p>
        <Button href="/contact" variant="outline" className="shrink-0">
          Contact Dave →
        </Button>
      </div>
    </motion.div>
  );
}
