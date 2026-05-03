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
        {/* Feature 1 placeholder */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-10">
          <div className="flex items-start gap-6">
            <span className="text-4xl text-[var(--accent-teal)]">⚙</span>
            <div className="flex-1">
              <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Lab Feature 1
              </p>
              <h2 className="font-[var(--font-barlow)] font-semibold text-3xl uppercase tracking-wide text-[var(--text-primary)] mb-3">
                Engineering Brief Analyser
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-xl">
                Paste a plain-English description of an engineering problem or workflow. Get back
                the likely automation approach, estimated time saving, suggested toolchain, and
                what Dave would do.
              </p>
              <div className="inline-block px-3 py-1 bg-amber-900/30 text-amber-400 border border-amber-800/50 rounded text-xs font-[var(--font-jetbrains)] uppercase tracking-wider">
                Coming in Phase 4
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 placeholder */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-10">
          <div className="flex items-start gap-6">
            <span className="text-4xl text-[var(--accent-teal)]">◈</span>
            <div className="flex-1">
              <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Lab Feature 2
              </p>
              <h2 className="font-[var(--font-barlow)] font-semibold text-3xl uppercase tracking-wide text-[var(--text-primary)] mb-3">
                Drawing Intelligence Demo
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-xl">
                Upload a photo of an engineering sketch, diagram, or P&ID fragment. Get back what
                it is, what it represents, and what the Darbury automation pipeline could do with
                it.
              </p>
              <div className="inline-block px-3 py-1 bg-amber-900/30 text-amber-400 border border-amber-800/50 rounded text-xs font-[var(--font-jetbrains)] uppercase tracking-wider">
                Coming in Phase 4
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3 placeholder */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-10">
          <div className="flex items-start gap-6">
            <span className="text-4xl text-[var(--accent-teal)]">⬡</span>
            <div className="flex-1">
              <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Lab Feature 3
              </p>
              <h2 className="font-[var(--font-barlow)] font-semibold text-3xl uppercase tracking-wide text-[var(--text-primary)] mb-3">
                Automation Opportunity Finder
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-xl">
                Answer 5 questions about your workflow. Get a personalised report of 3 automation
                opportunities — branded, copyable, and optionally emailed to you.
              </p>
              <div className="inline-block px-3 py-1 bg-amber-900/30 text-amber-400 border border-amber-800/50 rounded text-xs font-[var(--font-jetbrains)] uppercase tracking-wider">
                Coming in Phase 4
              </div>
            </div>
          </div>
        </div>
      </div>
      </LabGate>
    </main>
  );
}
