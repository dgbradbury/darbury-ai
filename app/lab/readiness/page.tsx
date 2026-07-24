import Link from "next/link";
import LabGate from "@/components/lab/LabGate";
import ReadinessScorer from "@/components/lab/ReadinessScorer";

export const metadata = {
  title: "Digital Twin Readiness Scorer",
  description:
    "Describe your current asset data — spreadsheets, PDFs, scattered drawings — and get a digital-twin maturity score plus a staged roadmap for getting there.",
};

export default function ReadinessPage() {
  return (
    <main className="pt-24 pb-24 px-6 max-w-5xl mx-auto">
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] mb-10">
        <Link href="/lab" className="hover:text-[var(--accent-teal)] transition-colors">
          AI Tools
        </Link>
        {" / "}
        <span className="text-[var(--text-secondary)]">Digital Twin Readiness Scorer</span>
      </p>

      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
        AI Tool 8
      </p>
      <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
        Digital Twin Readiness Scorer
      </h1>
      <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-3">
        Tell me the state of your asset data — spreadsheets, PDFs, scattered drawings, whatever it
        is — and get a maturity score plus a staged roadmap to a working digital twin.
      </p>
      <p className="text-sm text-[var(--text-muted)] max-w-2xl mb-16">
        Built on how I actually run rollouts: start small, build on the pockets of data you already
        have, show what&apos;s achievable, then take the next step. Dave reviews every submission.
      </p>

      <LabGate>
        <ReadinessScorer />
      </LabGate>
    </main>
  );
}
