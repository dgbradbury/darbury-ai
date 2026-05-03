import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, getAllProjects } from "@/lib/content";
import Badge from "@/components/ui/Badge";
import PlaceholderAsset from "@/components/ui/PlaceholderAsset";

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Darbury`,
    description: project.tagline,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const allProjects = getAllProjects();
  const related = allProjects
    .filter((p) => p.slug !== slug && p.category === project.category)
    .slice(0, 3);

  const statusLabel =
    project.status === "pre-release"
      ? "coming-soon"
      : project.status === "concept"
      ? "coming-soon"
      : "teal";

  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/work"
            className="text-xs text-[var(--text-muted)] font-[var(--font-jetbrains)] hover:text-[var(--accent-teal)] transition-colors"
          >
            ← Work
          </Link>
          <Badge label={project.category} />
          <Badge label={project.status} variant={statusLabel} />
        </div>

        <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
          {project.title}
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-10">{project.tagline}</p>

        <PlaceholderAsset
          title={project.title}
          prompt={`Dark technical illustration: ${project.tagline}, engineering context, teal accent on dark background, isometric perspective`}
          aspectRatio="aspect-[21/9]"
        />
      </section>

      {/* Content */}
      <section className="px-6 pb-24 max-w-3xl mx-auto prose prose-invert prose-headings:font-[var(--font-barlow)] prose-headings:uppercase prose-headings:tracking-wide prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-a:text-[var(--accent-teal)] prose-strong:text-[var(--text-primary)]">
        <div
          dangerouslySetInnerHTML={{ __html: project.content }}
          className="[&>h2]:font-[var(--font-barlow)] [&>h2]:font-semibold [&>h2]:text-2xl [&>h2]:uppercase [&>h2]:tracking-wide [&>h2]:text-[var(--text-primary)] [&>h2]:mt-10 [&>h2]:mb-4 [&>p]:text-[var(--text-secondary)] [&>p]:leading-relaxed [&>ul]:text-[var(--text-secondary)]"
        />
      </section>

      {/* Tech stack */}
      <section className="px-6 pb-16 max-w-3xl mx-auto">
        <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
          Tech Stack
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-sm font-[var(--font-jetbrains)] text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border)] px-3 py-1.5 rounded"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 max-w-3xl mx-auto">
        <div className="bg-[var(--bg-surface)] border border-[var(--accent-teal)]/30 rounded-lg p-8">
          <h2 className="font-[var(--font-barlow)] font-semibold text-2xl uppercase tracking-wide text-[var(--text-primary)] mb-3">
            Could this solve your problem?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            If {project.title} sounds relevant to a challenge you&apos;re facing, I&apos;d like to hear about it.
          </p>
          <Link
            href={`/contact?project=${encodeURIComponent(project.title)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-teal)] text-[var(--bg-primary)] font-[var(--font-barlow)] font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal-dim)] transition-colors"
          >
            Get in Touch →
          </Link>
        </div>
      </section>

      {/* Related projects */}
      {related.length > 0 && (
        <section className="px-6 pb-24 border-t border-[var(--border)] pt-16 bg-[var(--bg-surface)]">
          <div className="max-w-6xl mx-auto">
            <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-8">
              Related work
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/work/${p.slug}`}
                  className="block bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-6 hover:border-[var(--accent-teal)]/40 transition-colors group"
                >
                  <h3 className="font-[var(--font-barlow)] font-semibold text-lg uppercase tracking-wide text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">{p.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
