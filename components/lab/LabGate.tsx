"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import Button from "@/components/ui/Button";

interface UserData {
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
}

type GateState = "checking" | "disabled" | "unverified" | "code_sent" | "verified" | "expired";

interface LabGateProps {
  children: ReactNode;
}

export default function LabGate({ children }: LabGateProps) {
  const [state, setState] = useState<GateState>("checking");
  const [disabledMessage, setDisabledMessage] = useState("");
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    company: "",
    jobTitle: "",
    phone: "",
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    checkLabStatus();
  }, []);

  async function checkLabStatus() {
    try {
      const res = await fetch("/api/lab/status");
      if (res.ok) {
        const data = await res.json();
        if (!data.enabled) {
          setDisabledMessage(data.message ?? "The AI Lab is temporarily unavailable.");
          setState("disabled");
          return;
        }
      }
    } catch {
      // Status check failed — proceed to session check
    }
    checkSession();
  }

  async function checkSession() {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        setState("verified");
      } else if (res.status === 401) {
        const data = await res.json();
        setState(data.expired ? "expired" : "unverified");
      } else {
        setState("unverified");
      }
    } catch {
      setState("unverified");
    }
  }

  function startResendCooldown() {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setState("code_sent");
      startResendCooldown();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email, code }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? "Incorrect code. Please try again.");
        return;
      }

      setState("verified");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not resend code. Please try again.");
        return;
      }
      startResendCooldown();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (state === "checking") {
    return (
      <div className="animate-pulse space-y-4 max-w-lg mx-auto mt-12">
        <div className="h-6 bg-[var(--bg-elevated)] rounded w-1/2" />
        <div className="h-4 bg-[var(--bg-elevated)] rounded w-3/4" />
        <div className="h-12 bg-[var(--bg-elevated)] rounded" />
      </div>
    );
  }

  if (state === "disabled") {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-10 text-center">
          <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-[0.25em] mb-4">
            AI Lab
          </p>
          <h2 className="font-[var(--font-barlow)] font-bold text-3xl uppercase tracking-tight text-[var(--text-primary)] mb-4">
            Lab Unavailable
          </h2>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
            {disabledMessage}
          </p>
          <Button href="/contact" variant="outline">
            Contact Dave →
          </Button>
        </div>
      </div>
    );
  }

  if (state === "verified") {
    return <>{children}</>;
  }

  return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-8">
        {(state === "unverified" || state === "expired") && (
          <>
            {state === "expired" && (
              <p className="text-sm text-[var(--accent-teal)] mb-4 font-[var(--font-jetbrains)]">
                Your session has expired. Please verify again.
              </p>
            )}
            <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-3">
              AI Tools Access
            </p>
            <h2 className="font-[var(--font-barlow)] font-bold text-3xl uppercase tracking-tight text-[var(--text-primary)] mb-2">
              Access the Darbury AI Tools
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Enter your details to receive a verification code. This helps us keep the tools
              available for genuine engineering enquiries.
            </p>

            <form onSubmit={handleSendCode} className="space-y-4">
              {(
                [
                  { key: "name", label: "Full Name", type: "text" },
                  { key: "email", label: "Email Address", type: "email" },
                  { key: "company", label: "Company / Organisation", type: "text" },
                  { key: "jobTitle", label: "Job Title / Role", type: "text" },
                  { key: "phone", label: "Phone Number", type: "tel" },
                ] as { key: keyof UserData; label: string; type: string }[]
              ).map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    required
                    value={userData[key]}
                    onChange={(e) =>
                      setUserData((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
                  />
                </div>
              ))}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? "Sending…" : "Send My Access Code →"}
              </Button>
            </form>

            <p className="text-xs text-[var(--text-muted)] mt-4">
              Your details are used only to personalise your Lab results and may be followed up
              by Dave Bradbury at Darbury Ltd.
            </p>
          </>
        )}

        {state === "code_sent" && (
          <>
            <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-3">
              Check your inbox
            </p>
            <h2 className="font-[var(--font-barlow)] font-bold text-3xl uppercase tracking-tight text-[var(--text-primary)] mb-2">
              Enter your code
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              We&apos;ve sent a 6-digit code to{" "}
              <span className="text-[var(--text-primary)]">{userData.email}</span>. It expires
              in 15 minutes.
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="\d{6}"
                placeholder="_ _ _ _ _ _"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-4 py-3 text-[var(--text-primary)] text-2xl tracking-[0.5em] font-[var(--font-jetbrains)] text-center focus:outline-none focus:border-[var(--accent-teal)] transition-colors"
              />

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <Button type="submit" disabled={loading || code.length !== 6} className="w-full">
                {loading ? "Verifying…" : "Verify & Continue →"}
              </Button>
            </form>

            <p className="text-xs text-[var(--text-muted)] mt-4">
              Didn&apos;t receive it? Check spam, or{" "}
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-[var(--accent-teal)] hover:underline disabled:opacity-40 disabled:no-underline"
              >
                {resendCooldown > 0 ? `resend the code (${resendCooldown}s)` : "resend the code"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
