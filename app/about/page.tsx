import PlaceholderAsset from "@/components/ui/PlaceholderAsset";
import Link from "next/link";

const CREDENTIALS = [
  { label: "Experience", value: "42 Years" },
  { label: "ADN Membership", value: "26 Years" },
  { label: "Founded Darbury Ltd", value: "Year 2000" },
  { label: "Status", value: "Apple, Microsoft & Autodesk Developer" },
];

const DOMAINS = [
  { title: "AutoCAD & Plant 3D", detail: "Deep platform expertise, 26yr ADN member" },
  { title: "Python Automation", detail: "Scripting, pipelines, AI integration" },
  { title: "Swift & iOS", detail: "Native apps, ARKit, Vision, Core ML" },
  { title: "Anthropic / Claude API", detail: "Server-side integration, domain tooling" },
  { title: "Power Platform", detail: "Power Automate, Power Apps, M365" },
  { title: "OCR & Computer Vision", detail: "Document intelligence, drawing analysis" },
];

export default function AboutPage() {
  return (
    <main className="pt-24 pb-24">
      {/* Header */}
      <section className="px-6 max-w-6xl mx-auto mb-20">
        <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
          About
        </p>
        <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-6">
          Dave Bradbury
          <br />
          <span className="text-[var(--text-secondary)]">is Darbury.</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl">
          No corporate separation. The work is personal. The expertise is real. The problems are
          engineering problems.
        </p>
      </section>

      {/* Bio + Photo */}
      <section className="px-6 max-w-6xl mx-auto mb-20 grid md:grid-cols-2 gap-12 items-start">
        <div>
          <PlaceholderAsset
            title="Dave Bradbury"
            prompt="Professional engineering consultant headshot, dark studio background, teal lighting accent, confident, experienced"
            aspectRatio="aspect-[3/4]"
            icon="◎"
          />
        </div>

        <div className="flex flex-col gap-6">
          {/* Credentials strip */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {CREDENTIALS.map(({ label, value }) => (
              <div
                key={label}
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4"
              >
                <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  {label}
                </p>
                <p className="font-[var(--font-barlow)] font-semibold text-lg text-[var(--accent-teal)]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[var(--text-secondary)] leading-relaxed">
            I started on a drawing board in the early 1980s. Every line was deliberate — there
            was no undo. That discipline shapes how I think about software: every tool I build
            has to earn its place by making an engineer&apos;s day materially better.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            I founded Darbury Ltd in 2000 as an engineering technology consultancy. Over the
            following decades I built deep expertise in AutoCAD, Plant 3D, and the broader
            Autodesk ecosystem — joining the Autodesk Developer Network in the early days and
            maintaining that membership for 26 years.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            When the AI era arrived properly, I didn&apos;t pivot to it — I extended into it.
            The same problems I&apos;d been solving with Python scripts and AutoLISP are now
            solvable at a completely different scale and sophistication with Claude. I use Haiku
            for cost-efficient production tools and larger models for complex reasoning. The
            model is a means, not the point.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="px-6 py-20 bg-[var(--bg-surface)] border-y border-[var(--border)] mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="font-[var(--font-barlow)] font-bold text-3xl md:text-4xl uppercase tracking-tight text-[var(--text-primary)] leading-tight mb-6">
            &quot;AI is a tool, not a destination.{" "}
            <span className="text-[var(--accent-teal)]">
              The destination is your solved problem.&quot;
            </span>
          </blockquote>
        </div>
      </section>

      {/* Capability map */}
      <section className="px-6 max-w-6xl mx-auto mb-20">
        <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
          Capability map
        </p>
        <h2 className="font-[var(--font-barlow)] font-bold text-4xl uppercase tracking-tight text-[var(--text-primary)] mb-10">
          Domain Expertise
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {DOMAINS.map(({ title, detail }) => (
            <div
              key={title}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6 hover:border-[var(--accent-teal)]/40 transition-colors"
            >
              <h3 className="font-[var(--font-barlow)] font-semibold text-lg uppercase tracking-wide text-[var(--text-primary)] mb-2">
                {title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-6 max-w-3xl mx-auto mb-20">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-10">
          <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-6">
            Testimonial
          </p>
          <blockquote className="text-lg text-[var(--text-primary)] leading-relaxed mb-6 italic">
            &quot;[Testimonial from John Lusty — to be confirmed for public use]&quot;
          </blockquote>
          <p className="text-sm text-[var(--text-secondary)]">
            — John Lusty
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 max-w-4xl mx-auto text-center">
        <h2 className="font-[var(--font-barlow)] font-bold text-4xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
          Got a Problem Worth Solving?
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          No pitch decks. No discovery calls before you&apos;re ready. Just tell me what you&apos;re trying
          to fix.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent-teal)] text-[var(--bg-primary)] font-[var(--font-barlow)] font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal-dim)] transition-colors"
        >
          Get in Touch →
        </Link>
      </section>
    </main>
  );
}
