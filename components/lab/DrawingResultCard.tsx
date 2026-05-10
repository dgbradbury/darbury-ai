"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

interface DrawingResultCardProps {
  response: string;
  previewUrl: string | null;
  fileName: string;
  mimeType: string;
  onReset: () => void;
}

export default function DrawingResultCard({
  response,
  previewUrl,
  fileName,
  mimeType,
  onReset,
}: DrawingResultCardProps) {
  const isPdf = mimeType === "application/pdf";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden"
    >
      {/* Image + response — side by side on md+, stacked on mobile */}
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="md:w-56 shrink-0 bg-[var(--bg-elevated)] flex items-center justify-center p-5 border-b md:border-b-0 md:border-r border-[var(--border)]"
        >
          {isPdf ? (
            /* PDF — show icon + link to open the file */
            <a
              href={previewUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 text-center group"
            >
              <svg
                className="w-14 h-14 text-[var(--accent-teal)] opacity-80 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 13h6M9 17h4"
                />
              </svg>
              <span className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] underline underline-offset-2 group-hover:opacity-80 transition-opacity break-all">
                View PDF
              </span>
            </a>
          ) : previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={fileName}
              className="max-w-full max-h-56 md:max-h-80 object-contain rounded"
            />
          ) : null}
        </motion.div>

        {/* Response panel */}
        <div className="flex-1 p-8">
          <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">
            AI Assessment
          </p>
          {/* Render each paragraph separately for readable spacing */}
          {response.split(/\n\n+/).map((para, i) => (
            <p
              key={i}
              className="text-[var(--text-primary)] leading-relaxed mb-4 last:mb-0"
            >
              {para.trim()}
            </p>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-[var(--border)] px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-[var(--text-secondary)] flex-1">
          Want to go deeper? The Darbury pipeline can work directly with your original CAD
          files, PDFs, and DWG data — not just photos.
        </p>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Button href="/contact" variant="outline">
            Contact Dave about this drawing →
          </Button>
          <Button variant="ghost" onClick={onReset}>
            Upload Another
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
