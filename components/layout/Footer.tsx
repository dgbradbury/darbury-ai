import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)] mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
        <div>
          <p className="font-[var(--font-barlow)] font-bold text-lg uppercase tracking-widest text-[var(--accent-teal)] mb-3">
            Darbury
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Engineering Technology Consultancy.<br />
            Dave Bradbury — 42 years of engineering problems, solved faster with AI.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-4">Navigate</p>
          <nav className="flex flex-col gap-2">
            {[
              { href: "/work", label: "Work" },
              { href: "/about", label: "About" },
              { href: "/lab", label: "AI Lab" },
              { href: "/contact", label: "Contact" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-4">Connect</p>
          <a
            href="https://www.linkedin.com/in/darbury/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-teal)] transition-colors"
          >
            LinkedIn
          </a>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            <a href="mailto:dave@darbury.com" className="hover:text-[var(--accent-teal)] transition-colors">
              dave@darbury.com
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-6 py-4 max-w-6xl mx-auto flex justify-between items-center">
        <p className="text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} Darbury Ltd. All rights reserved.
        </p>
        <p className="text-xs text-[var(--text-muted)] font-[var(--font-jetbrains)]">
          Built with AI. Solved with experience.
        </p>
      </div>
    </footer>
  );
}
