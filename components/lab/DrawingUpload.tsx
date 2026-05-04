"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import DrawingResultCard from "@/components/lab/DrawingResultCard";

type UploadState =
  | "idle"
  | "invalid_file"
  | "file_selected"
  | "submitting"
  | "success"
  | "limit_reached"
  | "error";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DrawingUpload() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── File selection ────────────────────────────────────────────────────────

  function acceptFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage("Please upload a PNG, JPG, or WEBP image.");
      setUploadState("invalid_file");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`Image is ${formatBytes(file.size)} — please use a file under 4 MB.`);
      setUploadState("invalid_file");
      return;
    }

    // Release any previous object URL to avoid memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage("");
    setUploadState("file_selected");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
    // Reset so the same file can be re-selected after removal
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

  // ─── Analysis ──────────────────────────────────────────────────────────────

  async function handleAnalyse() {
    if (!selectedFile || uploadState === "submitting") return;

    setUploadState("submitting");
    setErrorMessage("");

    try {
      // Encode image as base64 via FileReader
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // result is "data:image/png;base64,<data>" — strip the prefix
          const full = reader.result as string;
          resolve(full.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const res = await fetch("/api/lab/drawing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: selectedFile.type }),
      });

      const data = await res.json();

      if (res.status === 429 || data.error === "limit_reached") {
        setUploadState("limit_reached");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Unknown error");
      }

      setResult(data.response);
      setUploadState("success");
    } catch (err) {
      console.error("[DrawingUpload]", err);
      setErrorMessage("Analysis unavailable — please try again in a moment.");
      setUploadState("error");
    }
  }

  // ─── Reset ─────────────────────────────────────────────────────────────────

  function handleReset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMessage("");
    setUploadState("idle");
  }

  // ─── Derived booleans ──────────────────────────────────────────────────────

  const showDropZone = uploadState !== "success" && uploadState !== "limit_reached";
  const isDroppable = uploadState === "idle" || uploadState === "invalid_file";
  const showPreview =
    uploadState === "file_selected" ||
    uploadState === "submitting" ||
    uploadState === "error";

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Drop zone ───────────────────────────────────────────────────────── */}
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
            {/* Empty drop zone */}
            {isDroppable && (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                {/* Upload icon */}
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
                  Drop your drawing here, or{" "}
                  <span className="text-[var(--accent-teal)] underline underline-offset-2">
                    click to browse
                  </span>
                </p>

                <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] mt-3 mb-5">
                  PNG · JPG · WEBP · Max 4 MB
                </p>

                <p className="text-xs text-[var(--text-muted)] max-w-sm leading-relaxed">
                  Engineering drawings · P&amp;IDs · CAD screenshots · Hand sketches ·
                  Isometric drawings · Process flow diagrams · Instrument loop diagrams
                </p>

                {/* Validation error */}
                {uploadState === "invalid_file" && (
                  <p className="mt-5 text-sm text-red-400">{errorMessage}</p>
                )}
              </div>
            )}

            {/* File selected / submitting / error preview */}
            {showPreview && selectedFile && previewUrl && (
              <div className="flex items-start gap-5 p-6">
                {/* Thumbnail */}
                <div className="shrink-0 w-24 h-24 rounded border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Drawing preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* File metadata */}
                <div className="flex-1 min-w-0 py-1">
                  <p className="text-[var(--text-primary)] text-sm font-medium truncate mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] mb-4">
                    {selectedFile.type.replace("image/", "").toUpperCase()} ·{" "}
                    {formatBytes(selectedFile.size)}
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

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleInputChange}
          />

          {/* Action row */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {uploadState === "file_selected" && (
              <Button type="button" onClick={handleAnalyse}>
                Analyse Drawing →
              </Button>
            )}

            {uploadState === "submitting" && (
              <Button type="button" disabled>
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Analysing drawing…
                </span>
              </Button>
            )}

            {uploadState === "error" && (
              <>
                <Button type="button" onClick={handleAnalyse}>
                  Try Again →
                </Button>
                <p className="text-sm text-red-400">{errorMessage}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Result / limit panels ────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {uploadState === "success" && result && previewUrl && selectedFile && (
          <DrawingResultCard
            key="result"
            response={result}
            previewUrl={previewUrl}
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
              You&apos;ve used your 3 analyses for today. Come back tomorrow — or contact Dave
              directly to discuss your drawing now.
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
