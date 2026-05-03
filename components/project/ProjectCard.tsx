import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { ProjectMeta } from "@/lib/content";

interface ProjectCardProps {
  project: ProjectMeta;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const isComingSoon = project.status === "pre-release";

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--accent-teal)]/50 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Placeholder thumbnail */}
      <div className="aspect-video bg-[var(--bg-elevated)] relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
          <span className="text-3xl text-[var(--accent-teal)] opacity-30">◈</span>
          <p className="font-[var(--font-barlow)] font-semibold text-sm uppercase tracking-wider text-[var(--text-muted)] text-center">
            {project.title}
          </p>
        </div>
        {isComingSoon && (
          <div className="absolute top-3 right-3">
            <Badge label="Coming Soon" variant="coming-soon" />
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-[var(--font-barlow)] font-semibold text-lg uppercase tracking-wide text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors">
            {project.title}
          </h3>
          <Badge label={project.category} />
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
          {project.tagline}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-xs font-[var(--font-jetbrains)] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded"
            >
              {t}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="text-xs font-[var(--font-jetbrains)] text-[var(--text-muted)]">
              +{project.tech.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="px-5 pb-4">
        <span className="text-xs text-[var(--accent-teal)] font-[var(--font-barlow)] uppercase tracking-wider group-hover:underline">
          Explore →
        </span>
      </div>
    </Link>
  );
}
