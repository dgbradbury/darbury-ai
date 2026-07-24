import Link from "next/link";
import LabGate from "@/components/lab/LabGate";
import ExtractorUpload from "@/components/lab/ExtractorUpload";

export const metadata = {
  title: "Instant Tag & Line Extractor",
  description:
    "Upload a P&ID or ISO fragment and get back a structured, downloadable table of tags, lines, equipment, and instruments in seconds — the Darbury extraction pipeline as a teaser.",
};

export default function ExtractorPage() {
  return (
    <main className="pt-24 pb-24 px-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] mb-10">
        <Link href="/lab" className="hover:text-[var(--accent-teal)] transition-colors">
          AI Tools
        </Link>
        {" / "}
        <span className="text-[var(--text-secondary)]">Instant Tag &amp; Line Extractor</span>
      </p>

      {/* Page header */}
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
        AI Tool 4
      </p>
      <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
        Instant Tag &amp; Line Extractor
      </h1>
      <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-3">
        Upload a P&amp;ID or ISO fragment and get your own data back as a structured table you can
        download — tags, lines, equipment, and instruments, read straight off the drawing.
      </p>
      <p className="text-sm text-[var(--text-muted)] max-w-2xl mb-16">
        This reads a single photo as a taster. The full PIDA and ISO BOM pipeline works from your
        original CAD and PDF files, across every sheet, with verification built in. Dave reviews
        every submission.
      </p>

      <LabGate>
        <ExtractorUpload />
      </LabGate>
    </main>
  );
}
