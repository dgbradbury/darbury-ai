interface BadgeProps {
  label: string;
  variant?: "default" | "coming-soon" | "teal";
}

const variants = {
  default: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]",
  "coming-soon": "bg-amber-400 text-[var(--bg-primary)] border-amber-300 font-semibold shadow-md",
  teal: "bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border-[var(--accent-teal)]/30",
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
