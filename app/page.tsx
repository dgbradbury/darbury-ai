import Link from "next/link";
import BlueprintGrid from "@/components/layout/BlueprintGrid";
import ProjectCard from "@/components/project/ProjectCard";
import { getAllProjects } from "@/lib/content";

const PILLARS = [
  {
    icon: "⚙",
    title: "Engineering Automation",
    body: "Batch processing, drawing intelligence, and workflow automation for CAD and plant design environments.",
  },
  {
    icon: "◈",
    title: "AI-Powered Tooling",
    body: "Domain-specific AI applications built on Claude — chatbots, document intelligence, and analysis tools that actually understand engineering.",
  },
  {
    icon: "⬡",
    title: "CAD & Plant 3D Intelligence",
    body: "Deep AutoCAD Plant 3D expertise: MCP integrations, spec management, P&ID validation, and report automation.",
  },
];

const FEATURED_SLUGS = ["plantmcp", "plant-viewer", "pid-analyser"];

export default function HomePage() {
  const allProjects = getAllProjects();
  const featured = FEATURED_SLUGS
    .map((slug) => allProjects.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <main className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        <BlueprintGrid />

        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--accent-teal)]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-6">
            Dave Bradbury · Darbury Ltd
          </p>

          <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight text-[var(--text-primary)] leading-none mb-6">
            42 Years of{" "}
            <span className="text-[var(--accent-teal)]">Engineering Problems.</span>
            <br />
            Solved Faster with AI.
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
            Engineering Technology Consultancy. CAD automation, AI-powered tooling, and
            intelligent workflows — built for engineers who need their problems actually solved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/work"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--accent-teal)] text-[var(--bg-primary)] font-[var(--font-barlow)] font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal-dim)] transition-colors active:scale-95"
            >
              See the Work →
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[var(--accent-teal)] text-[var(--accent-teal)] font-[var(--font-barlow)] font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal)]/10 transition-colors active:scale-95"
            >
              Get in Touch
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-muted)]">
          <span className="text-xs font-[var(--font-jetbrains)] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-[var(--text-muted)] to-transparent" />
        </div>
      </section>

      {/* ── Problem Pillars ──────────────────────────────────── */}
      <section className="px-6 py-24 max-w-6xl mx-auto w-full">
        <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-3">
          What I do
        </p>
        <h2 className="font-[var(--font-barlow)] font-bold text-4xl md:text-5xl uppercase tracking-tight text-[var(--text-primary)] mb-12">
          Three Capabilities.
          <br />
          <span className="text-[var(--text-secondary)]">One Destination: Your Solved Problem.</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-8 hover:border-[var(--accent-teal)]/40 transition-colors group"
            >
              <div className="text-3xl text-[var(--accent-teal)] mb-4 group-hover:scale-110 transition-transform inline-block">
                {p.icon}
              </div>
              <h3 className="font-[var(--font-barlow)] font-semibold text-xl uppercase tracking-wide text-[var(--text-primary)] mb-3">
                {p.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Projects ─────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="px-6 py-24 bg-[var(--bg-surface)] border-y border-[var(--border)]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-3">
                  Featured work
                </p>
                <h2 className="font-[var(--font-barlow)] font-bold text-4xl md:text-5xl uppercase tracking-tight text-[var(--text-primary)]">
                  Recent Projects
                </h2>
              </div>
              <Link
                href="/work"
                className="hidden md:inline text-sm text-[var(--accent-teal)] font-[var(--font-barlow)] uppercase tracking-wider hover:underline"
              >
                View all →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featured.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>

            <div className="mt-8 md:hidden">
              <Link
                href="/work"
                className="text-sm text-[var(--accent-teal)] font-[var(--font-barlow)] uppercase tracking-wider hover:underline"
              >
                View all projects →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Quote / CTA ──────────────────────────────────────── */}
      <section className="px-6 py-32 text-center max-w-4xl mx-auto">
        <blockquote className="font-[var(--font-barlow)] font-bold text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight text-[var(--text-primary)] leading-tight mb-8">
          &quot;I don&apos;t use AI for the sake of it.{" "}
          <span className="text-[var(--accent-teal)]">I use it to solve real engineering problems.&quot;</span>
        </blockquote>
        <p className="text-[var(--text-secondary)] mb-10">— Dave Bradbury, Darbury Ltd</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/lab"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--accent-teal)] text-[var(--bg-primary)] font-[var(--font-barlow)] font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal-dim)] transition-colors"
          >
            Try the AI Lab →
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[var(--border)] text-[var(--text-secondary)] font-[var(--font-barlow)] font-semibold uppercase tracking-wider text-sm rounded hover:border-[var(--accent-teal)]/40 hover:text-[var(--text-primary)] transition-colors"
          >
            About Dave
          </Link>
        </div>
      </section>
    </main>
  );
}
