import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");
const KNOWLEDGE_DIR = path.join(process.cwd(), "content/knowledge");

export interface ProjectMeta {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  status: "live" | "active" | "pre-release" | "concept" | "delivered" | "experimental";
  tech: string[];
  featured?: boolean;
  order?: number;
  image?: string;
  imageFit?: "cover" | "contain";
  liveUrl?: string;
}

export interface ProjectSection {
  title: string;
  body: string;
}

export interface Project extends ProjectMeta {
  content: string;
  sections: ProjectSection[];
}

function parseSections(content: string): ProjectSection[] {
  const sections: ProjectSection[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const line of content.split("\n")) {
    if (line.startsWith("## ")) {
      if (current) {
        sections.push({ title: current.title, body: current.lines.join("\n").trim() });
      }
      current = { title: line.slice(3).trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) {
    sections.push({ title: current.title, body: current.lines.join("\n").trim() });
  }

  return sections;
}

export function getAllProjects(): ProjectMeta[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf-8");
      const { data } = matter(raw);
      return { slug, ...data } as ProjectMeta;
    })
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getProject(slug: string): Project | null {
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { slug, ...data, content, sections: parseSections(content) } as Project;
}

export function getKnowledgeBase(): string {
  if (!fs.existsSync(KNOWLEDGE_DIR)) return "";
  const files = ["bio.md", "services.md", "projects-summary.md", "faqs.md"];
  return files
    .filter((f) => fs.existsSync(path.join(KNOWLEDGE_DIR, f)))
    .map((f) => fs.readFileSync(path.join(KNOWLEDGE_DIR, f), "utf-8"))
    .join("\n\n---\n\n");
}
