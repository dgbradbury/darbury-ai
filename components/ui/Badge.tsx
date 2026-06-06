interface BadgeProps {
  label: string;
  variant?: "default" | "coming-soon" | "teal" | "active";
}

const variants = {
  default: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]",
  "coming-soon": "bg-amber-400 text-[var(--bg-primary)] border-amber-300 font-semibold shadow-md",
  teal: "bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border-[var(--accent-teal)]/30",
  active: "bg-[var(--accent-teal)] text-[var(--bg-primary)] border-[var(--accent-teal)] font-semibold shadow-md",
};

export default function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-xs font-[var(--font-jetbrains)] uppercase tracking-wider border rounded ${variants[variant]}`}
    >
      {label}
    </span>
  );
}
