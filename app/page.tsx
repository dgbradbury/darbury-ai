import Link from "next/link";
import BlueprintGrid from "@/components/layout/BlueprintGrid";
import DrawingReader from "@/components/home/DrawingReader";
import AskPlantDemo from "@/components/home/AskPlantDemo";
import Reveal from "@/components/layout/Reveal";
import ProductBand from "@/components/home/ProductBand";
import ToolGrid from "@/components/home/ToolGrid";
import ProofBand from "@/components/home/ProofBand";
import HowIWork from "@/components/home/HowIWork";

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

      {/* ── Try it now ───────────────────────────────────────── */}
      <AskPlantDemo />

      {/* ── Live products ────────────────────────────────────── */}
      <ProductBand />

      {/* ── Eight live tools ─────────────────────────────────── */}
      <ToolGrid />

      {/* ── How I work ───────────────────────────────────────── */}
      <HowIWork />

      {/* ── Proof ────────────────────────────────────────────── */}
      <ProofBand />

      {/* ── Close ────────────────────────────────────────────── */}
      <section className="px-6 py-28 text-center max-w-3xl mx-auto">
        <Reveal>
          <h2 className="font-display font-extrabold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-6">
            Send Me <span className="text-[var(--accent-teal)]">One Drawing.</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-10">
            I&apos;ll run it through the tools &amp; send back what they found. If it&apos;s useful we
            talk about the rest of the set. If it isn&apos;t, you&apos;ve lost nothing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/contact?project=${encodeURIComponent("One drawing trial")}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--accent-teal)] text-[var(--bg-primary)] font-display font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal-dim)] transition-colors"
            >
              Send a Drawing →
            </Link>
            <Link
              href="/lab"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[var(--border)] text-[var(--text-secondary)] font-display font-semibold uppercase tracking-wider text-sm rounded hover:border-[var(--accent-teal)]/40 hover:text-[var(--text-primary)] transition-colors"
            >
              Try the Tools Yourself
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
