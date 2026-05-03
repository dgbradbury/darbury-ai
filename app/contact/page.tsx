"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ContactForm() {
  const searchParams = useSearchParams();
  const projectParam = searchParams.get("project") || "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    project: projectParam,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    if (projectParam) {
      setForm((f) => ({ ...f, project: projectParam }));
    }
  }, [projectParam]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--accent-teal)]/30 rounded-lg p-10 text-center">
        <div className="text-4xl text-[var(--accent-teal)] mb-4">✓</div>
        <h2 className="font-[var(--font-barlow)] font-semibold text-2xl uppercase tracking-wide text-[var(--text-primary)] mb-3">
          Message Received
        </h2>
        <p className="text-[var(--text-secondary)]">
          Thanks — I&apos;ll read this properly and come back to you. No auto-responders here.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid md:grid-cols-2 gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-[var(--font-jetbrains)] uppercase tracking-widest text-[var(--text-muted)]">
            Name *
          </span>
          <input
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)]/60 transition-colors"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-[var(--font-jetbrains)] uppercase tracking-widest text-[var(--text-muted)]">
            Email *
          </span>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)]/60 transition-colors"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-[var(--font-jetbrains)] uppercase tracking-widest text-[var(--text-muted)]">
          Company (optional)
        </span>
        <input
          name="company"
          type="text"
          value={form.company}
          onChange={handleChange}
          placeholder="Your company or organisation"
          className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)]/60 transition-colors"
        />
      </label>

      {projectParam && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-[var(--font-jetbrains)] uppercase tracking-widest text-[var(--text-muted)]">
            Re: Project
          </span>
          <input
            name="project"
            type="text"
            value={form.project}
            onChange={handleChange}
            className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--accent-teal)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)]/60 transition-colors"
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-[var(--font-jetbrains)] uppercase tracking-widest text-[var(--text-muted)]">
          Tell me your problem *
        </span>
        <textarea
          name="message"
          required
          rows={6}
          value={form.message}
          onChange={handleChange}
          placeholder="Describe what you're trying to fix, automate, or build. The more specific, the better."
          className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-teal)]/60 transition-colors resize-none"
        />
      </label>

      {status === "error" && (
        <p className="text-red-400 text-sm">
          Something went wrong — please try again or email dave@darbury.com directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="self-start inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent-teal)] text-[var(--bg-primary)] font-[var(--font-barlow)] font-semibold uppercase tracking-wider text-sm rounded hover:bg-[var(--accent-teal-dim)] transition-colors disabled:opacity-50 active:scale-95"
      >
        {status === "sending" ? "Sending…" : "Send Message →"}
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <main className="pt-24 pb-24 px-6 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <p className="font-[var(--font-jetbrains)] text-xs text-[var(--accent-teal)] uppercase tracking-[0.25em] mb-4">
            Contact
          </p>
          <h1 className="font-[var(--font-barlow)] font-bold text-5xl md:text-6xl uppercase tracking-tight text-[var(--text-primary)] mb-6">
            Let&apos;s Talk About Your Problem
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
            No pitch decks. No discovery calls before you&apos;re ready. Just tell me what
            you&apos;re trying to fix — I&apos;ll read it properly and come back to you with an
            honest response.
          </p>

          <div className="flex flex-col gap-4 mb-10">
            <a
              href="mailto:dave@darbury.com"
              className="text-sm text-[var(--accent-teal)] hover:underline font-[var(--font-jetbrains)]"
            >
              dave@darbury.com
            </a>
            <a
              href="https://www.linkedin.com/in/darbury/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-colors"
            >
              LinkedIn →
            </a>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-6">
            <p className="font-[var(--font-jetbrains)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">
              Typical enquiries
            </p>
            <ul className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              <li>AutoCAD / Plant 3D automation</li>
              <li>AI integration for engineering workflows</li>
              <li>Document intelligence & OCR pipelines</li>
              <li>iOS app development</li>
              <li>General engineering technology consultancy</li>
            </ul>
          </div>
        </div>

        <div>
          <Suspense fallback={<div className="text-[var(--text-muted)] text-sm">Loading form…</div>}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
