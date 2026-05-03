interface PlaceholderAssetProps {
  title: string;
  prompt?: string;
  aspectRatio?: string;
  icon?: string;
}

export default function PlaceholderAsset({
  title,
  prompt,
  aspectRatio = "aspect-video",
  icon = "◈",
}: PlaceholderAssetProps) {
  return (
    <div
      className={`${aspectRatio} relative overflow-hidden rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] flex flex-col items-center justify-center gap-3 p-6`}
    >
      {/* Blueprint grid overlay */}
      <div className="absolute inset-0 blueprint-grid pointer-events-none" />

      <span className="text-4xl text-[var(--accent-teal)] opacity-40 z-10">{icon}</span>
      <p className="font-[var(--font-barlow)] font-semibold text-lg uppercase tracking-wider text-[var(--text-secondary)] z-10 text-center">
        {title}
      </p>
      {prompt && (
        <p className="text-xs text-[var(--text-muted)] z-10 text-center max-w-sm font-[var(--font-jetbrains)] italic">
          {prompt}
        </p>
      )}
    </div>
  );
}
