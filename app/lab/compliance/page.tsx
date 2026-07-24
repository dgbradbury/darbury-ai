import Link from "next/link";
import LabGate from "@/components/lab/LabGate";
import ComplianceChecker from "@/components/lab/ComplianceChecker";

export const metadata = {
  title: "Standard Compliance Gap Checker",
  description:
    "Paste an engineering spec, work instruction, or tag list and get back the gaps against a named standard — ISO 19650, tag-numbering conventions, naming rules, and more.",
};

export default function CompliancePage() {
  return (
    <main className="pt-24 pb-24 px-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] mb-10">
        <Link href="/lab" className="hover:text-[var(--accent-teal)] transition-colors">
          AI Tools
        </Link>
        {" / "}
        <span className="text-[var(--text-secondary)]">Standard Compliance Gap Checker</span>
      </p>

      {/* Page header */}
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
        AI Tool 5
      </p>
      <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
        Standard Compliance Gap Checker
      </h1>
      <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-3">
        Paste a spec, work instruction, tag list, or naming schema, pick a standard, and get back
        the gaps — each one with a plain finding and what to do about it.
      </p>
      <p className="text-sm text-[var(--text-muted)] max-w-2xl mb-16">
        A fast first pass on the text you paste. A full governance review works from your live
        documents and schema. Dave reviews every submission.
      </p>

      <LabGate>
        <ComplianceChecker />
      </LabGate>
    </main>
  );
}
