"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import ExtractorResultCard, { ExtractItem } from "@/components/lab/ExtractorResultCard";

type UploadState =
  | "idle"
  | "invalid_file"
  | "file_selected"
  | "submitting"
  | "success"
  | "limit_reached"
  | "error";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

function formatFileType(mime: string): string {
  if (mime === "application/pdf") return "PDF";
  return mime.replace("image/", "").toUpperCase();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ExtractResult {
  documentType: string;
  items: ExtractItem[];
  note: string;
}

export default function ExtractorUpload() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function acceptFile(file: File) {
    const rawType = file.type;
    const isPdfByExt = file.name.toLowerCase().endsWith(".pdf");
    const effectiveMime = rawType === "" && isPdfByExt ? "application/pdf" : rawType;

    if (!ALLOWED_TYPES.includes(effectiveMime)) {
      setErrorMessage("Please upload a PNG, JPG, WEBP, or PDF file under 5 MB.");
      setUploadState("invalid_file");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File is ${formatBytes(file.size)} — please use a file under 5 MB.`);
      setUploadState("invalid_file");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setFileMimeType(effectiveMime);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage("");
    setUploadState("file_selected");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  }

  async function handleExtract() {
    if (!selectedFile || uploadState === "submitting") return;

    setUploadState("submitting");
    setErrorMessage("");

    try {
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const res = await fetch("/api/lab/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: fileMimeType }),
      });

      const data = await res.json();

      if (res.status === 429 || data.error === "limit_reached") {
        setUploadState("limit_reached");
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Unknown error");

      setResult({ documentType: data.documentType, items: data.items ?? [], note: data.note ?? "" });
      setUploadState("success");
    } catch (err) {
      console.error("[ExtractorUpload]", err);
      setErrorMessage("Extraction unavailable — please try again in a moment.");
      setUploadState("error");
    }
  }

  function handleReset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setFileMimeType("");
    setPreviewUrl(null);
    setResult(null);
    setErrorMessage("");
    setUploadState("idle");
  }

  const showDropZone = uploadState !== "success" && uploadState !== "limit_reached";
  const isDroppable = uploadState === "idle" || uploadState === "invalid_file";
  const showPreview =
    uploadState === "file_selected" || uploadState === "submitting" || uploadState === "error";

  return (
    <div className="max-w-3xl mx-auto">
      {showDropZone && (
        <div className="mb-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => isDroppable && fileInputRef.current?.click()}
            className={[
              "border-2 border-dashed rounded-lg transition-all duration-200",
              isDragging
                ? "border-[var(--accent-teal)] bg-[var(--accent-teal)]/5 scale-[1.01]"
                : isDroppable
                ? "border-[var(--border)] hover:border-[var(--accent-teal)]/50 bg-[var(--bg-surface)] cursor-pointer"
                : "border-[var(--border)] bg-[var(--bg-surface)]",
            ].join(" ")}
          >
            {isDroppable && (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <svg
                  className="w-12 h-12 text-[var(--accent-teal)] mb-5 opacity-80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                <p className="text-[var(--text-secondary)] mb-1">
                  Drop your P&amp;ID or ISO here, or{" "}
                  <span className="text-[var(--accent-teal)] underline underline-offset-2">
                    click to browse
                  </span>
                </p>
                <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] mt-3 mb-5">
                  PNG · JPG · WEBP · PDF · Max 5 MB
                </p>
                <p className="text-xs text-[var(--text-muted)] max-w-sm leading-relaxed">
                  P&amp;IDs · Isometric drawings · Equipment lists · Line schedules ·
                  Instrument index sheets · CAD screenshots
                </p>
                {uploadState === "invalid_file" && (
                  <p className="mt-5 text-sm text-red-400">{errorMessage}</p>
                )}
              </div>
            )}

            {showPreview && selectedFile && (
              <div className="flex items-start gap-5 p-6">
                <div className="shrink-0 w-24 h-24 rounded border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] flex items-center justify-center">
                  {fileMimeType === "application/pdf" ? (
                    <svg
                      className="w-10 h-10 text-[var(--accent-teal)] opacity-80"
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
                  ) : previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Drawing preview" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <p className="text-[var(--text-primary)] text-sm font-medium truncate mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] mb-4">
                    {formatFileType(fileMimeType)} · {formatBytes(selectedFile.size)}
                  </p>
                  {uploadState !== "submitting" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors underline underline-offset-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,application/pdf,.pdf"
            className="hidden"
            onChange={handleInputChange}
          />

          <div className="flex flex-wrap items-center gap-4 mt-4">
            {uploadState === "file_selected" && (
              <Button type="button" onClick={handleExtract}>
                Extract Tags &amp; Lines →
              </Button>
            )}
            {uploadState === "submitting" && (
              <Button type="button" disabled>
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Reading drawing…
                </span>
              </Button>
            )}
            {uploadState === "error" && (
              <>
                <Button type="button" onClick={handleExtract}>
                  Try Again →
                </Button>
                <p className="text-sm text-red-400">{errorMessage}</p>
              </>
            )}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {uploadState === "success" && result && selectedFile && (
          <ExtractorResultCard
            key="result"
            documentType={result.documentType}
            items={result.items}
            note={result.note}
            fileName={selectedFile.name}
            onReset={handleReset}
          />
        )}

        {uploadState === "limit_reached" && (
          <motion.div
            key="limit"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-[var(--bg-surface)] border border-amber-800/50 rounded-lg p-10 text-center"
          >
            <p className="font-[var(--font-jetbrains)] text-xs text-amber-400 uppercase tracking-[0.2em] mb-3">
              Daily Limit Reached
            </p>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              You&apos;ve used your 3 extractions for today. Come back tomorrow — or contact Dave
              directly to run your full drawing set now.
            </p>
            <Button href="/contact" variant="outline">
              Contact Dave →
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
