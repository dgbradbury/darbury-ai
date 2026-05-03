"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCard";
import type { ProjectMeta } from "@/lib/content";

const CATEGORIES = [
  "All",
  "Engineering Automation",
  "AI Tooling",
  "CAD/Plant 3D",
  "Concepts & Future",
];

export default function ProjectFilter({ projects }: { projects: ProjectMeta[] }) {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All"
      ? projects
      : projects.filter((p) => p.category === active);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-12">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2 text-xs font-[var(--font-barlow)] uppercase tracking-wider rounded border transition-colors ${
              active === cat
                ? "bg-[var(--accent-teal)] text-[var(--bg-primary)] border-[var(--accent-teal)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-teal)]/40 hover:text-[var(--text-primary)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-[var(--text-muted)] text-sm">No projects in this category yet.</p>
      )}
    </>
  );
}
