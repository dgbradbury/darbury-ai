import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
    title: project.title,
    description: project.tagline,
    openGraph: {
      title: `${project.title} | Darbury AI`,
      description: project.tagline,
      type: "article",
    },
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
      : project.status === "active"
      ? "active"
      : "teal";

  const statusBadgeLabel =
    project.status === "pre-release"
      ? "Coming Soon"
      : project.status === "active"
      ? "Active"
      : project.status;

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
          <Badge label={statusBadgeLabel} variant={statusLabel} />
        </div>

        <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
          {project.title}
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-10">{project.tagline}</p>

        {project.image ? (
          <div className="relative">
            <div className="aspect-[21/9] relative overflow-hidden rounded-lg group">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full absolute inset-0"
                  aria-label={`Open ${project.title}`}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className={project.imageFit === "contain" ? "object-contain" : "object-cover"}
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    priority
                  />
                  <div className="absolute inset-0 bg-[var(--accent-teal)]/0 group-hover:bg-[var(--accent-teal)]/10 transition-colors duration-200 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-primary)]/80 backdrop-blur-sm border border-[var(--accent-teal)] text-[var(--accent-teal)] font-[var(--font-barlow)] font-semibold uppercase tracking-wider text-sm rounded">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      Try it live
                    </span>
                  </div>
                </a>
              ) : (
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className={project.imageFit === "contain" ? "object-contain" : "object-cover"}
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  priority
                />
              )}
            </div>
            {project.liveUrl && (
              <div className="mt-4 flex justify-end">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--accent-teal)] text-[var(--accent-teal)] font-[var(--font-barlow)] font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal)] hover:text-[var(--bg-primary)] transition-colors"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Try it live
                </a>
              </div>
            )}
          </div>
        ) : (
          <PlaceholderAsset
            title={project.title}
            prompt={`Dark technical illustration: ${project.tagline}, engineering context, teal accent on dark background, isometric perspective`}
            aspectRatio="aspect-[21/9]"
          />
        )}
      </section>

      {/* Content */}
      <section className="px-6 pb-24 max-w-3xl mx-auto">
        <div className="space-y-14">
          {project.sections.map((section, i) => (
            <div key={section.title} className="border-l-2 border-[var(--accent-teal)] pl-6">
              <span className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] block mb-3">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-[var(--font-barlow)] font-bold text-3xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
                {section.title}
              </h2>
              {section.body.split("\n\n").map((para, j) => (
                <p key={j} className="text-[var(--text-secondary)] leading-relaxed mb-4 last:mb-0">
                  {para.trim()}
                </p>
              ))}
            </div>
          ))}
        </div>
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
            If {project.title}{" "}sounds relevant to a challenge you&apos;re facing, I&apos;d like to hear about it.
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
