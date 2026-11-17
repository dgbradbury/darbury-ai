import Link from "next/link";
import BlueprintGrid from "@/components/layout/BlueprintGrid";
import DrawingReader from "@/components/home/DrawingReader";
import Reveal from "@/components/layout/Reveal";
import ProductBand from "@/components/home/ProductBand";

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

const schema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Darbury AI",
  url: "https://www.darbury.ai",
  description:
    "Engineering technology consultancy — CAD automation, AI tooling & intelligent workflows built on 42 years of engineering practice.",
  founder: { "@type": "Person", name: "Dave Bradbury", jobTitle: "Managing Director & Owner" },
  parentOrganization: { "@type": "Organization", name: "Darbury Ltd", url: "https://www.darbury.com" },
  email: "dave@darbury.com",
  address: { "@type": "PostalAddress", addressRegion: "Essex", addressCountry: "UK" },
  sameAs: [
    "https://www.darbury.com",
    "https://www.linkedin.com/in/darbury/",
  ],
};

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative px-6 pt-28 pb-20 lg:pt-32 overflow-hidden">
        <BlueprintGrid />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center gap-12">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-6">
              Dave Bradbury · Darbury Ltd
            </p>

            <h1 className="font-display font-extrabold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] leading-[0.95] mb-6">
              42 Years of{" "}
              <span className="text-[var(--accent-teal)]">Engineering Problems.</span>
              <br />
              Solved Faster with AI.
            </h1>

            <p className="text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed mb-8">
              I build AI tools that read P&amp;IDs, isometrics &amp; 3D models, then hand you the
              data. Four products are live &amp; there are eight tools you can try right now.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link
                href="/lab"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--accent-teal)] text-[var(--bg-primary)] font-display font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal-dim)] transition-colors active:scale-95"
              >
                Try a Live Tool →
              </Link>
              <Link
                href="#products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[var(--accent-teal)] text-[var(--accent-teal)] font-display font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal)]/10 transition-colors active:scale-95"
              >
                See the Products
              </Link>
            </div>

            <p className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
              8 live tools · 4 products · 26 years Autodesk ADN
            </p>
          </div>

          <DrawingReader />
        </div>
      </section>

      {/* ── Problem Pillars ──────────────────────────────────── */}
      <section className="px-6 py-24 max-w-6xl mx-auto w-full">
        <p className="font-mono text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-3">
          What I do
        </p>
        <h2 className="font-display font-bold text-4xl md:text-5xl uppercase tracking-tight text-[var(--text-primary)] mb-12">
          Three Capabilities.
          <br />
          <span className="text-[var(--text-secondary)]">One Destination: Your Solved Problem.</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <Reveal
              key={p.title}
              delay={i * 0.12}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-8 hover:border-[var(--accent-teal)]/40 transition-colors group"
            >
              <div className="text-3xl text-[var(--accent-teal)] mb-4 group-hover:scale-110 transition-transform inline-block">
                {p.icon}
              </div>
              <h3 className="font-display font-semibold text-xl uppercase tracking-wide text-[var(--text-primary)] mb-3">
                {p.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Live products ────────────────────────────────────── */}
      <ProductBand />

      {/* ── Quote / CTA ──────────────────────────────────────── */}
      <section className="px-6 py-32 text-center max-w-4xl mx-auto">
        <Reveal>
        <blockquote className="font-display font-bold text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight text-[var(--text-primary)] leading-tight mb-8">
          &quot;I don&apos;t use AI for the sake of it.{" "}
          <span className="text-[var(--accent-teal)]">I use AI to solve real engineering problems.&quot;</span>
        </blockquote>
        <p className="text-[var(--text-secondary)] mb-10">— Dave Bradbury, Darbury Ltd</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/lab"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--accent-teal)] text-[var(--bg-primary)] font-display font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal-dim)] transition-colors"
          >
            Try the AI Tools →
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[var(--border)] text-[var(--text-secondary)] font-display font-semibold uppercase tracking-wider text-sm rounded hover:border-[var(--accent-teal)]/40 hover:text-[var(--text-primary)] transition-colors"
          >
            About Dave →
          </Link>
        </div>
        </Reveal>
      </section>
    </main>
  );
}
