import Link from "next/link";
import LabGate from "@/components/lab/LabGate";
import DrawingUpload from "@/components/lab/DrawingUpload";

export const metadata = {
  title: "Drawing Intelligence Demo — Darbury AI Lab",
  description:
    "Upload a photo of an engineering drawing, P&ID, sketch, or diagram. Find out what AI can see — and what the Darbury automation pipeline could do with it.",
};

export default function DrawingIntelligencePage() {
  return (
    <main className="pt-24 pb-24 px-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] mb-10">
        <Link href="/lab" className="hover:text-[var(--accent-teal)] transition-colors">
          AI Lab
        </Link>
        {" / "}
        <span className="text-[var(--text-secondary)]">Drawing Intelligence Demo</span>
      </p>

      {/* Page header */}
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
        Lab Feature 2
      </p>
      <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
        Drawing Intelligence Demo
      </h1>
      <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-3">
        Upload a photo of an engineering drawing, P&amp;ID, sketch, or diagram. Find out what AI
        can see — and what the Darbury automation pipeline could do with it.
      </p>
      <p className="text-sm text-[var(--text-muted)] max-w-2xl mb-16">
        This demo uses a photo for instant access. The full Darbury pipeline works with your
        original CAD files, PDFs, and DWG data for complete extraction and automation.
      </p>

      {/* Lab gate wraps the tool — verified users see DrawingUpload directly */}
      <LabGate>
        <DrawingUpload />
      </LabGate>
    </main>
  );
}
