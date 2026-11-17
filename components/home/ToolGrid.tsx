import Link from "next/link";
import Reveal from "@/components/layout/Reveal";
import ToolIcon from "@/components/ui/ToolIcon";
import { LAB_TOOLS } from "@/lib/lab-tools";

export default function ToolGrid() {
  return (
    <section className="px-6 py-24 max-w-6xl mx-auto w-full">
      <p className="font-mono text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-3">
        The Lab
      </p>
      <h2 className="font-display font-bold text-4xl md:text-5xl uppercase tracking-tight text-[var(--text-primary)] mb-12">
        Eight Tools You Can Try Today.
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {LAB_TOOLS.map((tool, i) => (
          <Reveal key={tool.slug} delay={(i % 4) * 0.08}>
            <Link
              href={`/lab/${tool.slug}`}
              className="group flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--accent-teal)]/50 hover:-translate-y-1 transition-all duration-300"
            >
              <ToolIcon d={tool.icon} className="w-8 h-8 text-[var(--accent-teal)] mb-4" />
              <h3 className="font-display font-semibold text-lg uppercase tracking-wide leading-tight text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors mb-2">
                {tool.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-snug">{tool.short}</p>
            </Link>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-sm text-[var(--text-muted)]">
        Free to try. A quick email check keeps the bots out.{" "}
        <Link href="/lab" className="text-[var(--accent-teal)] hover:underline">
          See them all in the Lab →
        </Link>
      </p>
    </section>
  );
}
