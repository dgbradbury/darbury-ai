import Link from "next/link";
import LabGate from "@/components/lab/LabGate";

export const metadata = {
  title: "Live AI Tools",
  description: "Live AI tools built for engineering workflows — try them directly in your browser.",
};

export default function LabPage() {
  return (
    <main className="pt-24 pb-24 px-6 max-w-6xl mx-auto">
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
        AI Tools
      </p>
      <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
        Live AI Tools
      </h1>
      <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-16">
        Eight AI tools built for real engineering problems. Free to try, directly in your
        browser, nothing to install. A quick email verification keeps the bots out (and lets
        me know who&apos;s finding them useful).
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
                AI Tool 1
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
                AI Tool 2
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
                AI Tool 3
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

        {/* Feature 4 — live */}
        <Link
          href="/lab/extractor"
          className="group bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-teal)]/50 rounded-lg p-10 transition-colors block"
        >
          <div className="flex items-start gap-6">
            <span className="text-4xl text-[var(--accent-teal)]">▤</span>
            <div className="flex-1">
              <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                AI Tool 4
              </p>
              <h2 className="font-[var(--font-barlow)] font-semibold text-3xl uppercase tracking-wide text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-teal)] transition-colors">
                Instant Tag &amp; Line Extractor
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-xl">
                Upload a P&amp;ID or ISO fragment and get your own data back as a structured,
                downloadable table — tags, lines, equipment &amp; instruments, read straight off
                the drawing.
              </p>
              <div className="inline-block px-3 py-1 bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 rounded text-xs font-[var(--font-jetbrains)] uppercase tracking-wider">
                Live — Try it →
              </div>
            </div>
          </div>
        </Link>

        {/* Feature 5 — live */}
        <Link
          href="/lab/compliance"
          className="group bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-teal)]/50 rounded-lg p-10 transition-colors block"
        >
          <div className="flex items-start gap-6">
            <span className="text-4xl text-[var(--accent-teal)]">✓</span>
            <div className="flex-1">
              <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                AI Tool 5
              </p>
              <h2 className="font-[var(--font-barlow)] font-semibold text-3xl uppercase tracking-wide text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-teal)] transition-colors">
                Standard Compliance Gap Checker
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-xl">
                Paste a spec, work instruction, or tag list, pick a standard (ISO 19650,
                tag-numbering, naming rules), and get back the gaps — each with a finding &amp; a
                fix.
              </p>
              <div className="inline-block px-3 py-1 bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 rounded text-xs font-[var(--font-jetbrains)] uppercase tracking-wider">
                Live — Try it →
              </div>
            </div>
          </div>
        </Link>

        {/* Feature 6 — live */}
        <Link
          href="/lab/ask-plant"
          className="group bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-teal)]/50 rounded-lg p-10 transition-colors block"
        >
          <div className="flex items-start gap-6">
            <span className="text-4xl text-[var(--accent-teal)]">◆</span>
            <div className="flex-1">
              <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                AI Tool 6
              </p>
              <h2 className="font-[var(--font-barlow)] font-semibold text-3xl uppercase tracking-wide text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-teal)] transition-colors">
                Ask the Plant
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-xl">
                Query a sample Plant 3D model in plain English — &quot;list all decommissioned pumps
                on line 200 with no P&amp;ID basis&quot; — and get a real answer. A read-only demo of
                the live-data engine.
              </p>
              <div className="inline-block px-3 py-1 bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 rounded text-xs font-[var(--font-jetbrains)] uppercase tracking-wider">
                Live — Try it →
              </div>
            </div>
          </div>
        </Link>

        {/* Feature 7 — live */}
        <Link
          href="/lab/ai-advisor"
          className="group bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-teal)]/50 rounded-lg p-10 transition-colors block"
        >
          <div className="flex items-start gap-6">
            <span className="text-4xl text-[var(--accent-teal)]">⬢</span>
            <div className="flex-1">
              <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                AI Tool 7
              </p>
              <h2 className="font-[var(--font-barlow)] font-semibold text-3xl uppercase tracking-wide text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-teal)] transition-colors">
                Cloud-or-Local AI Advisor
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-xl">
                Describe your data sensitivity, workflow &amp; hardware and get a straight call —
                cloud (Claude) vs on-prem (Ollama), which model, rough hardware, and why.
              </p>
              <div className="inline-block px-3 py-1 bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 rounded text-xs font-[var(--font-jetbrains)] uppercase tracking-wider">
                Live — Try it →
              </div>
            </div>
          </div>
        </Link>

        {/* Feature 8 — live */}
        <Link
          href="/lab/readiness"
          className="group bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-teal)]/50 rounded-lg p-10 transition-colors block"
        >
          <div className="flex items-start gap-6">
            <span className="text-4xl text-[var(--accent-teal)]">◉</span>
            <div className="flex-1">
              <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                AI Tool 8
              </p>
              <h2 className="font-[var(--font-barlow)] font-semibold text-3xl uppercase tracking-wide text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-teal)] transition-colors">
                Digital Twin Readiness Scorer
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 max-w-xl">
                Describe your current asset data — spreadsheets, PDFs, scattered drawings — and get a
                maturity score plus a staged roadmap to a working digital twin.
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
