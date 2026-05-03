interface BadgeProps {
  label: string;
  variant?: "default" | "coming-soon" | "teal";
}

const variants = {
  default: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]",
  "coming-soon": "bg-amber-900/30 text-amber-400 border-amber-800/50",
  teal: "bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border-[var(--accent-teal)]/30",
};

export default function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-[var(--font-jetbrains)] uppercase tracking-wider border rounded ${variants[variant]}`}
    >
      {label}
    </span>
  );
}
