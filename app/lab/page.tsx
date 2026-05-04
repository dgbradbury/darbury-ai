import Link from "next/link";
import LabGate from "@/components/lab/LabGate";

export const metadata = {
  title: "AI Lab — Darbury",
  description: "Live AI showcase features — try the tools that demonstrate what AI can do for engineering workflows.",
};

export default function LabPage() {
  return (
    <main className="pt-24 pb-24 px-6 max-w-6xl mx-auto">
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
        AI Lab
      </p>
      <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
        Live AI Demos
      </h1>
      <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-16">
        Three interactive tools that demonstrate AI applied to real engineering problems. No
        installation. No account needed. Just the technology working.
      </p>

      <LabGate>
      <div className="grid md:grid-cols-1 gap-8">
        {/* Feature 1 — live */}
        <Link
          href="/lab/brief-analyser"
          className="group bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-teal)]/50 rounded-lg p-10 transition-colors block"
        >
          <div className="flex items-start gap-6">
            <span className="text-4xl text-[var(--accent-teal)]">⚙</span>
            <div className="flex-1">
              <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Lab Feature 1
              </p>
              <h2 className="font-[var(--font-barlow)] font-semibold text-3xl uppercase tracking-wide text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-teal)] transition-colors">
                Engineering Brief Analyser
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-xl">
                Paste a plain-English description of an engineering problem or workflow. Get back
                the likely automation approach, suggested toolchain, and what a working solution
                could look like in practice.
              </p>
              <div className="inline-block px-3 py-1 bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 rounded text-xs font-[var(--font-jetbrains)] uppercase tracking-wider">
                Live — Try it →
              </div>
            </div>
          </div>
        </Link>

        {/* Feature 2 — live */}
        <Link
          href="/lab/drawing-intelligence"
          className="group bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-teal)]/50 rounded-lg p-10 transition-colors block"
        >
          <div className="flex items-start gap-6">
            <span className="text-4xl text-[var(--accent-teal)]">◈</span>
            <div className="flex-1">
              <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Lab Feature 2
              </p>
              <h2 className="font-[var(--font-barlow)] font-semibold text-3xl uppercase tracking-wide text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-teal)] transition-colors">
                Drawing Intelligence Demo
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-xl">
                Upload a photo of an engineering drawing, P&amp;ID fragment, or sketch. Find out
                what AI can see — and what the Darbury automation pipeline could do with it.
              </p>
              <div className="inline-block px-3 py-1 bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 rounded text-xs font-[var(--font-jetbrains)] uppercase tracking-wider">
                Live — Try it →
              </div>
            </div>
          </div>
        </Link>

        {/* Feature 3 — live */}
        <Link
          href="/lab/automation-finder"
          className="group bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-teal)]/50 rounded-lg p-10 transition-colors block"
        >
          <div className="flex items-start gap-6">
            <span className="text-4xl text-[var(--accent-teal)]">⬡</span>
            <div className="flex-1">
              <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Lab Feature 3
              </p>
              <h2 className="font-[var(--font-barlow)] font-semibold text-3xl uppercase tracking-wide text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-teal)] transition-colors">
                Automation Opportunity Finder
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-xl">
                Answer 5 questions about your workflow. Get a personalised report of 3 specific
                automation opportunities — emailed to you and reviewed by Dave.
              </p>
              <div className="inline-block px-3 py-1 bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 rounded text-xs font-[var(--font-jetbrains)] uppercase tracking-wider">
                Live — Try it →
              </div>
            </div>
          </div>
        </Link>
      </div>
      </LabGate>
    </main>
  );
}
