import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/layout/Reveal";
import LoopVideo from "@/components/home/LoopVideo";
import { getAllProjects } from "@/lib/content";

// The four products on sale. A product without a recording yet (P&ID BOM)
// gets a slow pan across its screenshot instead of a clip.
const PRODUCTS: { slug: string; clip?: string }[] = [
  { slug: "pid-analyser", clip: "/videos/pid-analyser/loop" },
  { slug: "pid-bom" },
  { slug: "iso-bom", clip: "/videos/iso-bom/loop" },
  { slug: "4d-construction-planner", clip: "/videos/4d-construction-planner/loop" },
];

export default function ProductBand() {
  const all = getAllProjects();
  const products = PRODUCTS.flatMap(({ slug, clip }) => {
    const p = all.find((x) => x.slug === slug);
    return p ? [{ ...p, clip }] : [];
  });

  return (
    <section id="products" className="px-6 py-24 bg-[var(--bg-surface)] border-y border-[var(--border)] scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-3">
              Products
            </p>
            <h2 className="font-display font-bold text-4xl md:text-5xl uppercase tracking-tight text-[var(--text-primary)]">
              Four Products. Live Today.
            </h2>
          </div>
          <Link
            href="/work"
            className="hidden md:inline text-sm text-[var(--accent-teal)] font-display uppercase tracking-wider hover:underline"
          >
            All my work →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {products.map((p, i) => (
            <Reveal
              key={p.slug}
              delay={(i % 2) * 0.12}
              className="flex flex-col bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--accent-teal)]/50 transition-colors"
            >
              <div className="aspect-video relative overflow-hidden bg-[var(--bg-elevated)]">
                {p.clip ? (
                  <LoopVideo src={`${p.clip}.mp4`} poster={`${p.clip}.jpg`} label={`${p.title} running`} />
                ) : (
                  p.image && (
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 560px"
                      className="object-cover animate-pan-y"
                    />
                  )
                )}
                <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded bg-[var(--accent-teal)] text-[var(--bg-primary)] font-semibold shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Live
                </span>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display font-bold text-2xl uppercase tracking-wide text-[var(--text-primary)] mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 flex-1">{p.tagline}</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/contact?project=${encodeURIComponent(p.title)}`}
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-[var(--accent-teal)] text-[var(--bg-primary)] font-display font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal-dim)] transition-colors"
                  >
                    Request a Trial
                  </Link>
                  <Link
                    href={`/work/${p.slug}`}
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-[var(--border)] text-[var(--text-secondary)] font-display font-semibold uppercase tracking-wider text-sm rounded hover:border-[var(--accent-teal)]/40 hover:text-[var(--text-primary)] transition-colors"
                  >
                    {p.videos?.length ? "Watch the Demo" : "See the Details"} →
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 md:hidden">
          <Link href="/work" className="text-sm text-[var(--accent-teal)] font-display uppercase tracking-wider hover:underline">
            All my work →
          </Link>
        </div>
      </div>
    </section>
  );
}
