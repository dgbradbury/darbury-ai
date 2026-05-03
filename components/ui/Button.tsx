import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 px-6 py-3 font-[var(--font-barlow)] font-semibold uppercase tracking-wider text-sm transition-all duration-200 rounded";

const variants = {
  primary:
    "bg-[var(--accent-teal)] text-[var(--bg-primary)] hover:bg-[var(--accent-teal-dim)] active:scale-95",
  outline:
    "border border-[var(--accent-teal)] text-[var(--accent-teal)] hover:bg-[var(--accent-teal)]/10 active:scale-95",
  ghost:
    "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:scale-95",
};

export default function Button({
  href,
  onClick,
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}
