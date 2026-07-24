import Link from "next/link";
import LabGate from "@/components/lab/LabGate";
import AskPlant from "@/components/lab/AskPlant";

export const metadata = {
  title: "Ask the Plant",
  description:
    "Query a sample Plant 3D dataset in plain English — 'list all decommissioned pumps on line 200 with no P&ID basis' — and get a real answer. A read-only demo of the PlantMCP live-data engine.",
};

export default function AskPlantPage() {
  return (
    <main className="pt-24 pb-24 px-6 max-w-5xl mx-auto">
      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] mb-10">
        <Link href="/lab" className="hover:text-[var(--accent-teal)] transition-colors">
          AI Tools
        </Link>
        {" / "}
        <span className="text-[var(--text-secondary)]">Ask the Plant</span>
      </p>

      <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
        AI Tool 6
      </p>
      <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
        Ask the Plant
      </h1>
      <p className="text-xl text-[var(--text-secondary)] max-w-2xl mb-3">
        Type a plain-English question and query a real asset register — tags, lines, equipment,
        instruments &amp; their status. No query language, no training, just ask.
      </p>
      <p className="text-sm text-[var(--text-muted)] max-w-2xl mb-16">
        This runs against a bundled demo model so you can feel it without touching your data. The
        same read-only engine points at your live Plant 3D model, with a human sign-off on every
        answer. Dave reviews every query.
      </p>

      <LabGate>
        <AskPlant />
      </LabGate>
    </main>
  );
}
