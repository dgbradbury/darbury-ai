import { getAllProjects } from "@/lib/content";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

export const metadata = {
  title: "Case Studies — Darbury",
  description: "In-depth case studies of engineering problems solved with AI, automation, and software. Real problems, real results.",
};

const OUTCOMES = [
  { metric: "75%", label: "Reduction in documentation time" },
  { metric: "2–3 days → hours", label: "PDF-to-DWG conversion turnaround" },
  { metric: "42 years", label: "Engineering domain expertise applied" },
  { metric: "3 labs", label: "Live AI tools in production" },
];

export default function PortfolioPage() {
  const projects = getAllProjects();
  const featuredProjects = projects.filter((p) => p.featured);
  const allProjects = projects;

  return (
    <main className="pt-24 pb-24">
      {/* Header */}
      <section className="px-6 max-w-6xl mx-auto mb-20">
        <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
          Case Studies
        </p>
        <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-6">
          Real Problems.
          <br />
          <span className="text-[var(--text-secondary)]">Real Results.</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl">
          Every engagement starts with an engineering problem that costs someone time or money.
          These are the solutions — documented from problem through to outcome.
        </p>
      </section>

      {/* Outcomes strip */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-surface)] mb-20">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {OUTCOMES.map(({ metric, label }) => (
            <div key={label} className="text-center">
              <p className="font-[var(--font-barlow)] font-bold text-2xl md:text-3xl text-[var(--accent-teal)] mb-1">
                {metric}
              </p>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider leading-snug">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Case studies list */}
      <section className="px-6 max-w-6xl mx-auto mb-20">
        <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-8">
          All case studies
        </p>

        <div className="flex flex-col gap-6">
          {allProjects.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="group bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--accent-teal)]/50 rounded-lg p-8 transition-colors block"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge label={project.category} />
                    {project.status === "live" && (
                      <span className="text-xs font-[var(--font-jetbrains)] text-[var(--accent-teal)] uppercase tracking-wider">
                        ● Live
                      </span>
                    )}
                  </div>
                  <h2 className="font-[var(--font-barlow)] font-semibold text-2xl uppercase tracking-wide text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors mb-2">
                    {project.title}
                  </h2>
                  <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                    {project.tagline}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-[var(--font-jetbrains)] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-[var(--accent-teal)] font-[var(--font-barlow)] text-sm uppercase tracking-wider group-hover:underline whitespace-nowrap pt-1">
                  Read →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 max-w-4xl mx-auto text-center">
        <h2 className="font-[var(--font-barlow)] font-bold text-4xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
          Have a Problem Worth Solving?
        </h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
          If any of these problems sound familiar, the next step is a direct conversation — not a pitch deck.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent-teal)] text-[var(--bg-primary)] font-[var(--font-barlow)] font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal-dim)] transition-colors"
        >
          Get in Touch →
        </Link>
      </section>
    </main>
  );
}
