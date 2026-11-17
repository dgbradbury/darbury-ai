import Image from "next/image";
import Reveal from "@/components/layout/Reveal";
import StatNumber from "@/components/ui/StatNumber";
import { LAB_TOOLS } from "@/lib/lab-tools";

const STATS = [
  { value: "42", label: "Years in engineering" },
  { value: "26", label: "Years Autodesk ADN" },
  { value: String(LAB_TOOLS.length), label: "Live AI tools" },
  { value: "4", label: "Products" },
];

export default function ProofBand() {
  return (
    <section className="px-6 py-24 bg-[var(--bg-surface)] border-y border-[var(--border)]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {STATS.map((s) => (
            <div key={s.label} className="border-l-2 border-[var(--accent-teal)] pl-5">
              <StatNumber
                value={s.value}
                className="font-display font-extrabold text-6xl md:text-7xl leading-none text-[var(--text-primary)] mb-2"
              />
              <p className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-start">
          <Reveal className="flex flex-col sm:flex-row gap-8 items-start">
            <Image
              src="/dave-bradbury-2026.jpg"
              alt="Dave Bradbury"
              width={160}
              height={160}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg object-cover object-[45%_30%] shrink-0 border border-[var(--border)]"
            />
            <div>
              <blockquote className="font-display font-bold text-3xl md:text-4xl uppercase tracking-tight text-[var(--text-primary)] leading-tight mb-4">
                &quot;I don&apos;t use AI for the sake of it.{" "}
                <span className="text-[var(--accent-teal)]">I use AI to solve real engineering problems.&quot;</span>
              </blockquote>
              <p className="text-[var(--text-secondary)]">Dave Bradbury, Darbury Ltd</p>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-8">
            <p className="font-mono text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
              Reference
            </p>
            <blockquote className="text-[var(--text-primary)] leading-relaxed mb-4">
              &ldquo;Dave has the ability to understand the nature of engineering software at both the
              developer level, as well as its application in a large enterprise environment where it
              must add value.&rdquo;
            </blockquote>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
              John Lusty · Portfolio Development for Siemens, Energy, Mining, Chemicals &amp; Infrastructure
            </p>
            <div className="border-t border-[var(--border)] pt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Image src="/images/badge-autodesk-adn.webp" alt="Autodesk Authorized Developer" width={180} height={46} />
              <p className="text-xs text-[var(--text-muted)]">Member since 2000</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
