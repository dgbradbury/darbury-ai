import Link from "next/link";
import LabGate from "@/components/lab/LabGate";
import BriefAnalyser from "@/components/lab/BriefAnalyser";

export const metadata = {
  title: "Engineering Brief Analyser — Darbury AI Lab",
  description:
    "Describe your engineering problem. Get an immediate assessment of the automation approach, toolchain, and what a solution could look like — from 42 years of engineering experience, assisted by AI.",
};

export default function BriefAnalyserPage() {
  return (
    <main className="pt-24 pb-24 px-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] mb-10">
        <Link href="/lab" className="hover:text-[var(--accent-teal)] transition-colors">
          AI Lab
        </Link>
        {" / "}
        <span className="text-[var(--text-secondary)]">Engineering Brief Analyser</span>
      </p>

      {/* Page header */}
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
        Lab Feature 1
      </p>
      <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
        Engineering Brief Analyser
      </h1>
      <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-3">
        Describe your problem. Get an immediate assessment of the automation approach, toolchain,
        and what a solution could look like — from 42 years of engineering experience, assisted
        by AI.
      </p>
      <p className="text-sm text-[var(--text-muted)] max-w-2xl mb-16">
        The AI provides an initial assessment. Dave reviews every submission and may follow up
        personally where there&apos;s a strong fit.
      </p>

      {/* Lab gate wraps the tool — verified users see BriefAnalyser directly */}
      <LabGate>
        <BriefAnalyser />
      </LabGate>
    </main>
  );
}
