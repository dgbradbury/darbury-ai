"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export interface ExtractItem {
  tag: string;
  category: string;
  description: string;
  detail: string;
}

interface ExtractorResultCardProps {
  documentType: string;
  items: ExtractItem[];
  note: string;
  fileName: string;
  onReset: () => void;
}

function toCsv(items: ExtractItem[]): string {
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const header = "Tag,Category,Description,Detail";
  const rows = items.map((it) => [it.tag, it.category, it.description, it.detail].map(esc).join(","));
  return [header, ...rows].join("\r\n");
}

function downloadCsv(items: ExtractItem[], fileName: string) {
  const base = fileName.replace(/\.[^.]+$/, "") || "extraction";
  const blob = new Blob([toCsv(items)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${base}-tags.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const CATEGORY_COLOURS: Record<string, string> = {
  Equipment: "var(--accent-teal)",
  Line: "#96B1AD",
  Instrument: "#BD759B",
  Valve: "#FFA17A",
  Other: "var(--text-muted)",
};

export default function ExtractorResultCard({
  documentType,
  items,
  note,
  fileName,
  onReset,
}: ExtractorResultCardProps) {
  const hasItems = items.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="px-8 pt-8 pb-5 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)]">
        <div>
          <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">
            Extracted Data · {items.length} {items.length === 1 ? "item" : "items"}
          </p>
          {documentType && (
            <p className="text-[var(--text-primary)] leading-relaxed max-w-xl">{documentType}</p>
          )}
        </div>
        {hasItems && (
          <Button type="button" onClick={() => downloadCsv(items, fileName)} className="shrink-0">
            Download CSV ↓
          </Button>
        )}
      </div>

      {/* Table */}
      {hasItems ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                {["Tag", "Category", "Description", "Detail"].map((h) => (
                  <th
                    key={h}
                    className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium px-6 py-3 border-b border-[var(--border)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} className="border-b border-[var(--border)]/50 last:border-0">
                  <td className="px-6 py-3 font-[var(--font-jetbrains)] text-[var(--accent-teal)] whitespace-nowrap">
                    {it.tag}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span
                      className="text-xs font-[var(--font-jetbrains)] uppercase tracking-wider"
                      style={{ color: CATEGORY_COLOURS[it.category] ?? "var(--text-muted)" }}
                    >
                      {it.category}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[var(--text-primary)]">{it.description}</td>
                  <td className="px-6 py-3 text-[var(--text-secondary)]">{it.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-8 py-10 text-center">
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            {note || "Nothing legible to extract from this file. A clearer scan or the original digital file would let the full pipeline read every tag."}
          </p>
        </div>
      )}

      {note && hasItems && (
        <p className="px-8 py-4 text-sm text-[var(--text-muted)] italic border-t border-[var(--border)]">
          {note}
        </p>
      )}

      {/* Footer CTA */}
      <div className="border-t border-[var(--border)] px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-[var(--text-secondary)] flex-1">
          This is a teaser reading a single photo. The full PIDA / ISO BOM pipeline works from
          your original CAD &amp; PDF files, at full sheet count, with verification built in.
        </p>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Button href="/contact" variant="outline">
            Talk to Dave about a full run →
          </Button>
          <Button variant="ghost" onClick={onReset}>
            Extract Another
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
