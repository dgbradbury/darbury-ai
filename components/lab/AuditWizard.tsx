"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import ReportCard, { type ReportResult } from "@/components/lab/ReportCard";

// ─── Question constants ───────────────────────────────────────────────────────

const Q2_OPTIONS = [
  "Repetitive data entry or copy-paste between systems",
  "Chasing approvals, sign-offs, or status updates",
  "Generating reports or documentation manually",
  "Re-entering data from drawings or physical documents",
  "Finding information across multiple systems",
];

const Q3_OPTIONS = [
  "Yes — we have automation in place",
  "We're exploring it but haven't implemented anything yet",
  "No — we do everything manually",
];

const Q5_OPTIONS = [
  "Cost — we're not sure the investment is justified",
  "Knowledge — we don't know where to start or who to trust",
  "Trust — we're not confident AI/automation will work reliably for us",
  "Time — we don't have capacity to implement and learn new systems",
  "Buy-in — leadership or team aren't convinced yet",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardPhase = 1 | 2 | 3 | 4 | 5 | "review" | "generating" | "success" | "limit" | "error";

interface Answers {
  q1_toolstack: string;
  q2_timeLoss: string[];
  q2_timeLossOther: string;
  q3_currentAutomation: string;
  q3_automationDetail: string;
  q4_successCriteria: string;
  q5_barriers: string[];
}

const BLANK: Answers = {
  q1_toolstack: "",
  q2_timeLoss: [],
  q2_timeLossOther: "",
  q3_currentAutomation: "",
  q3_automationDetail: "",
  q4_successCriteria: "",
  q5_barriers: [],
};

// ─── Animation variants ───────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: string) => ({
    x: dir === "forward" ? 36 : -36,
    opacity: 0,
  }),
  center: (dir: string) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
  exit: (dir: string) => ({
    x: dir === "forward" ? -36 : 36,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  }),
};

// ─── Small shared input components ───────────────────────────────────────────

function CharTextarea({
  value,
  onChange,
  placeholder,
  maxLength = 300,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-4 py-3 pb-8 text-[var(--text-primary)] text-sm leading-relaxed placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors resize-none"
      />
      <span
        className={`absolute bottom-3 right-4 font-[var(--font-jetbrains)] text-xs transition-colors ${
          value.length >= maxLength
            ? "text-amber-400"
            : "text-[var(--text-muted)]"
        }`}
      >
        {value.length}/{maxLength}
      </span>
    </div>
  );
}

function CheckItem({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-3 py-2.5 cursor-pointer group ${
        disabled && !checked ? "opacity-40" : ""
      }`}
    >
      <span
        className={[
          "mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors",
          checked
            ? "bg-[var(--accent-teal)] border-[var(--accent-teal)]"
            : "border-[var(--border)] group-hover:border-[var(--accent-teal)]/60",
        ].join(" ")}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-[var(--bg-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled && !checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm text-[var(--text-secondary)] leading-snug">{label}</span>
    </label>
  );
}

function RadioItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 py-2.5 cursor-pointer group">
      <span
        className={[
          "w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
          checked
            ? "border-[var(--accent-teal)]"
            : "border-[var(--border)] group-hover:border-[var(--accent-teal)]/60",
        ].join(" ")}
      >
        {checked && (
          <span className="w-2 h-2 rounded-full bg-[var(--accent-teal)] block" />
        )}
      </span>
      <input type="radio" className="sr-only" checked={checked} onChange={onChange} />
      <span className="text-sm text-[var(--text-secondary)] leading-snug">{label}</span>
    </label>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function WizardProgress({ step }: { step: WizardPhase }) {
  const stepNum =
    step === "review" ? 5 : step === "generating" || step === "success" ? 5 : (step as number);
  const pct = (stepNum / 5) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.15em]">
          {step === "review" ? "Review your answers" : `Question ${stepNum} of 5`}
        </p>
        <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)]">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`inline-block w-1.5 h-1.5 rounded-full mx-0.5 transition-colors ${
                i < stepNum ? "bg-[var(--accent-teal)]" : "bg-[var(--border)]"
              }`}
            />
          ))}
        </p>
      </div>
      <div className="h-0.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[var(--accent-teal)] rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Main wizard component ────────────────────────────────────────────────────

export default function AuditWizard() {
  const [phase, setPhase] = useState<WizardPhase>(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [answers, setAnswers] = useState<Answers>(BLANK);
  const [q2OtherChecked, setQ2OtherChecked] = useState(false);
  const [report, setReport] = useState<ReportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Navigation ──────────────────────────────────────────────────────────────

  function goNext() {
    setDirection("forward");
    setPhase((prev) => (prev === 5 ? "review" : ((prev as number) + 1) as WizardPhase));
  }

  function goBack() {
    setDirection("back");
    setPhase((prev) => {
      if (prev === "review") return 5;
      return ((prev as number) - 1) as WizardPhase;
    });
  }

  function goToStep(s: 1 | 2 | 3 | 4 | 5) {
    setDirection("back");
    setPhase(s);
  }

  // ── Per-step validation ─────────────────────────────────────────────────────

  function canProceed(): boolean {
    switch (phase) {
      case 1:
        return answers.q1_toolstack.trim().length > 0;
      case 2:
        return (
          answers.q2_timeLoss.length > 0 ||
          (q2OtherChecked && answers.q2_timeLossOther.trim().length > 0)
        );
      case 3:
        return answers.q3_currentAutomation !== "";
      case 4:
        return answers.q4_successCriteria.trim().length > 0;
      case 5:
        return answers.q5_barriers.length > 0;
      default:
        return true;
    }
  }

  // ── Answer helpers ──────────────────────────────────────────────────────────

  function set<K extends keyof Answers>(key: K, val: Answers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  }

  function toggleQ2(option: string, checked: boolean) {
    set("q2_timeLoss", checked
      ? [...answers.q2_timeLoss, option]
      : answers.q2_timeLoss.filter((o) => o !== option)
    );
  }

  function toggleQ5(option: string) {
    set(
      "q5_barriers",
      answers.q5_barriers.includes(option)
        ? answers.q5_barriers.filter((b) => b !== option)
        : answers.q5_barriers.length >= 2
        ? answers.q5_barriers // max 2
        : [...answers.q5_barriers, option]
    );
  }

  // Combined Q2 list for API submission and review display
  function q2Combined(): string[] {
    return [
      ...answers.q2_timeLoss,
      q2OtherChecked && answers.q2_timeLossOther.trim()
        ? `Other: ${answers.q2_timeLossOther.trim()}`
        : null,
    ].filter(Boolean) as string[];
  }

  // ── API call ────────────────────────────────────────────────────────────────

  async function handleGenerate() {
    setDirection("forward");
    setPhase("generating");
    setErrorMsg("");

    try {
      const res = await fetch("/api/lab/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q1_toolstack: answers.q1_toolstack,
          q2_timeLoss: q2Combined(),
          q3_currentAutomation: answers.q3_currentAutomation,
          q3_automationDetail: answers.q3_automationDetail,
          q4_successCriteria: answers.q4_successCriteria,
          q5_barriers: answers.q5_barriers,
        }),
      });

      const data = await res.json();

      if (res.status === 429 || data.error === "limit_reached") {
        setPhase("limit");
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Unknown error");

      setReport(data as ReportResult);
      setPhase("success");
    } catch (err) {
      console.error("[AuditWizard]", err);
      setErrorMsg("Report generation failed — please try again in a moment.");
      setPhase("error");
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  // Success and limit states are full-width, handled outside the wizard card
  if (phase === "success" && report) {
    return <ReportCard data={report} />;
  }

  if (phase === "limit") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-surface)] border border-amber-800/50 rounded-lg p-10 text-center"
      >
        <p className="font-[var(--font-jetbrains)] text-xs text-amber-400 uppercase tracking-[0.2em] mb-3">
          Daily Limit Reached
        </p>
        <p className="text-[var(--text-secondary)] mb-2 max-w-md mx-auto">
          You&apos;ve already generated a report today. Check your email for your last report.
        </p>
        <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
          Or contact Dave directly if you&apos;d like to discuss your workflow now.
        </p>
        <Button href="/contact" variant="outline">
          Contact Dave →
        </Button>
      </motion.div>
    );
  }

  const showProgress = typeof phase === "number" || phase === "review";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-8">
        {/* Progress bar — visible during questions and review */}
        {showProgress && <WizardProgress step={phase} />}

        {/* Step content — animated */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={String(phase)}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {/* ── Step 1: Toolstack ──────────────────────────────────────── */}
            {phase === 1 && (
              <div>
                <h3 className="font-[var(--font-barlow)] font-semibold text-2xl text-[var(--text-primary)] mb-6">
                  What software or tools does your team use on a daily basis?
                </h3>
                <CharTextarea
                  value={answers.q1_toolstack}
                  onChange={(v) => set("q1_toolstack", v)}
                  placeholder="e.g. AutoCAD, Excel, SAP, Outlook, SharePoint, custom in-house tools…"
                />
              </div>
            )}

            {/* ── Step 2: Time loss ──────────────────────────────────────── */}
            {phase === 2 && (
              <div>
                <h3 className="font-[var(--font-barlow)] font-semibold text-2xl text-[var(--text-primary)] mb-6">
                  Where does your team lose the most time?
                </h3>
                <div className="divide-y divide-[var(--border)]">
                  {Q2_OPTIONS.map((opt) => (
                    <CheckItem
                      key={opt}
                      label={opt}
                      checked={answers.q2_timeLoss.includes(opt)}
                      onChange={(v) => toggleQ2(opt, v)}
                    />
                  ))}
                  {/* Other row */}
                  <div className="py-2.5">
                    <CheckItem
                      label="Other"
                      checked={q2OtherChecked}
                      onChange={(v) => {
                        setQ2OtherChecked(v);
                        if (!v) set("q2_timeLossOther", "");
                      }}
                    />
                    {q2OtherChecked && (
                      <input
                        type="text"
                        maxLength={200}
                        value={answers.q2_timeLossOther}
                        onChange={(e) => set("q2_timeLossOther", e.target.value.slice(0, 200))}
                        placeholder="Briefly describe…"
                        className="ml-7 mt-1 w-[calc(100%-1.75rem)] bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
                        autoFocus
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Current automation ─────────────────────────────── */}
            {phase === 3 && (
              <div>
                <h3 className="font-[var(--font-barlow)] font-semibold text-2xl text-[var(--text-primary)] mb-6">
                  Do you currently use any automation or AI in your workflow?
                </h3>
                <div className="divide-y divide-[var(--border)]">
                  {Q3_OPTIONS.map((opt) => (
                    <RadioItem
                      key={opt}
                      label={opt}
                      checked={answers.q3_currentAutomation === opt}
                      onChange={() => {
                        set("q3_currentAutomation", opt);
                        if (opt !== Q3_OPTIONS[0]) set("q3_automationDetail", "");
                      }}
                    />
                  ))}
                </div>
                {answers.q3_currentAutomation === Q3_OPTIONS[0] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4"
                  >
                    <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      Briefly, what?
                    </label>
                    <CharTextarea
                      value={answers.q3_automationDetail}
                      onChange={(v) => set("q3_automationDetail", v)}
                      placeholder="e.g. We use Power Automate to route approval emails…"
                      rows={3}
                    />
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Step 4: Success criteria ───────────────────────────────── */}
            {phase === 4 && (
              <div>
                <h3 className="font-[var(--font-barlow)] font-semibold text-2xl text-[var(--text-primary)] mb-6">
                  What would a successful outcome look like for you?
                </h3>
                <CharTextarea
                  value={answers.q4_successCriteria}
                  onChange={(v) => set("q4_successCriteria", v)}
                  placeholder="e.g. Save 10 hours a week on report generation, reduce data entry errors, get drawings into our system faster…"
                />
              </div>
            )}

            {/* ── Step 5: Barriers ──────────────────────────────────────── */}
            {phase === 5 && (
              <div>
                <h3 className="font-[var(--font-barlow)] font-semibold text-2xl text-[var(--text-primary)] mb-2">
                  What&apos;s the biggest barrier stopping you from automating today?
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-[var(--font-jetbrains)] mb-6">
                  Select up to 2
                </p>
                <div className="divide-y divide-[var(--border)]">
                  {Q5_OPTIONS.map((opt) => (
                    <CheckItem
                      key={opt}
                      label={opt}
                      checked={answers.q5_barriers.includes(opt)}
                      disabled={answers.q5_barriers.length >= 2}
                      onChange={() => toggleQ5(opt)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Review screen ─────────────────────────────────────────── */}
            {phase === "review" && (
              <div>
                <h3 className="font-[var(--font-barlow)] font-semibold text-2xl text-[var(--text-primary)] mb-6">
                  Does this look right?
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      step: 1 as const,
                      label: "Tools used daily",
                      value: answers.q1_toolstack,
                    },
                    {
                      step: 2 as const,
                      label: "Biggest time losses",
                      value: q2Combined().join(", "),
                    },
                    {
                      step: 3 as const,
                      label: "Current automation",
                      value: answers.q3_automationDetail
                        ? `${answers.q3_currentAutomation} — ${answers.q3_automationDetail}`
                        : answers.q3_currentAutomation,
                    },
                    {
                      step: 4 as const,
                      label: "What success looks like",
                      value: answers.q4_successCriteria,
                    },
                    {
                      step: 5 as const,
                      label: "Biggest barriers",
                      value: answers.q5_barriers.join(", "),
                    },
                  ].map(({ step, label, value }) => (
                    <div
                      key={step}
                      className="bg-[var(--bg-elevated)] rounded-lg px-4 py-3 flex items-start gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.12em] mb-1">
                          {label}
                        </p>
                        <p className="text-sm text-[var(--text-primary)] leading-snug">{value}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => goToStep(step)}
                        className="shrink-0 text-xs text-[var(--accent-teal)] hover:underline underline-offset-2 font-[var(--font-jetbrains)]"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Generating ────────────────────────────────────────────── */}
            {phase === "generating" && (
              <div className="flex flex-col items-center py-12 text-center">
                <svg className="animate-spin h-8 w-8 text-[var(--accent-teal)] mb-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="font-[var(--font-barlow)] font-semibold text-xl text-[var(--text-primary)] mb-2">
                  Analysing your workflow…
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Generating 3 personalised opportunities
                </p>
              </div>
            )}

            {/* ── Error ─────────────────────────────────────────────────── */}
            {phase === "error" && (
              <div className="flex flex-col items-center py-10 text-center">
                <p className="text-red-400 mb-2 text-sm">{errorMsg}</p>
                <Button type="button" variant="outline" onClick={handleGenerate}>
                  Try Again →
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation buttons ─────────────────────────────────────────── */}
        {(typeof phase === "number" || phase === "review") && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border)]">
            <div>
              {(typeof phase === "number" && phase > 1) || phase === "review" ? (
                <Button type="button" variant="ghost" onClick={goBack}>
                  ← Back
                </Button>
              ) : (
                <span />
              )}
            </div>

            <div>
              {phase === "review" ? (
                <Button type="button" onClick={handleGenerate}>
                  Generate My Report →
                </Button>
              ) : (
                <Button type="button" onClick={goNext} disabled={!canProceed()}>
                  Next →
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
