import { getAllProjects } from "@/lib/content";
import ProjectFilter from "@/components/project/ProjectFilter";

export const metadata = {
  title: "Work — Engineering AI & Automation Projects",
  description:
    "Engineering problems solved with software, automation, and AI — Plant 3D tooling, MCP servers, drawing intelligence, 3D viewers and more.",
};

export default function WorkPage() {
  const projects = getAllProjects();

  return (
    <main className="pt-24 px-6 pb-24 max-w-6xl mx-auto">
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
        Portfolio
      </p>
      <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
        The Work
      </h1>
      <p className="text-[var(--text-secondary)] text-lg max-w-2xl mb-16">
        Engineering problems solved with software, automation, and AI. Every project starts with
        a real problem and ends with something that works.
      </p>

      <ProjectFilter projects={projects} />
    </main>
  );
}
