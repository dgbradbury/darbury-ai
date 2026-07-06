import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/content";

const BASE = "https://www.darbury.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/work`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/lab`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/lab/brief-analyser`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/lab/drawing-intelligence`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/lab/automation-finder`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/log`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.8 },
  ];

  const projectPages: MetadataRoute.Sitemap = getAllProjects().map((p) => ({
    url: `${BASE}/work/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...projectPages];
}
