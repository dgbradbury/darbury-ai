import Link from "next/link";
import LabGate from "@/components/lab/LabGate";
import AiAdvisor from "@/components/lab/AiAdvisor";

export const metadata = {
  title: "Cloud-or-Local AI Advisor",
  description:
    "Describe your data sensitivity, workflow and hardware, and get a straight recommendation — cloud (Claude) vs on-prem (Ollama), which model, rough hardware, and why.",
};

export default function AiAdvisorPage() {
  return (
    <main className="pt-24 pb-24 px-6 max-w-5xl mx-auto">
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] mb-10">
        <Link href="/lab" className="hover:text-[var(--accent-teal)] transition-colors">
          AI Tools
        </Link>
        {" / "}
        <span className="text-[var(--text-secondary)]">Cloud-or-Local AI Advisor</span>
      </p>

      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
        AI Tool 7
      </p>
      <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
        Cloud-or-Local AI Advisor
      </h1>
      <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-3">
        Tell me how sensitive your data is, what you want AI to do, and what hardware you&apos;ve
        got. Get a straight call — cloud or on-prem, which model, rough hardware, and why.
      </p>
      <p className="text-sm text-[var(--text-muted)] max-w-2xl mb-16">
        The kind of answer the big consultancies charge for a workshop to give you. It&apos;s a
        first-pass steer, not a spec, and Dave reviews every submission.
      </p>

      <LabGate>
        <AiAdvisor />
      </LabGate>
    </main>
  );
}
