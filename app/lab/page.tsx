import Link from "next/link";
import LabGate from "@/components/lab/LabGate";
import ToolIcon from "@/components/ui/ToolIcon";
import { LAB_TOOLS } from "@/lib/lab-tools";

export const metadata = {
  title: "Live AI Tools",
  description: "Live AI tools built for engineering workflows — try them directly in your browser.",
};

export default function LabPage() {
  return (
    <main className="pt-24 pb-24 px-6 max-w-6xl mx-auto">
      <p className="font-mono text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
        AI Tools
      </p>
      <h1 className="font-display font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
        Live AI Tools
      </h1>
      <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-16">
        Eight AI tools built for real engineering problems. Free to try, directly in your
        browser, nothing to install. A quick email verification keeps the bots out (and lets
        me know who&apos;s finding them useful).
      </p>

      <LabGate>
      <div className="grid md:grid-cols-1 gap-8">
        {LAB_TOOLS.map((tool, i) => (
          <Link
            key={tool.slug}
            href={`/lab/${tool.slug}`}
            className="group bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-teal)]/50 rounded-lg p-10 transition-colors block"
          >
            <div className="flex items-start gap-6">
              <ToolIcon d={tool.icon} className="w-10 h-10 shrink-0 text-[var(--accent-teal)]" />
              <div className="flex-1">
                <p className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  AI Tool {i + 1}
                </p>
                <h2 className="font-display font-semibold text-3xl uppercase tracking-wide text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-teal)] transition-colors">
                  {tool.title}
                </h2>
                <p className="text-[var(--text-secondary)] mb-6 max-w-xl">{tool.body}</p>
                <div className="inline-block px-3 py-1 bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 rounded text-xs font-mono uppercase tracking-wider">
                  Live — Try it →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      </LabGate>
    </main>
  );
}
