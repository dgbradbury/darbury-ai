"use client";

export default function BlueprintGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid-small" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3eb8a0" strokeWidth="0.5" />
          </pattern>
          <pattern id="grid-large" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#grid-small)" />
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#3eb8a0" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-large)" />
      </svg>
      {/* Radial fade to make grid fade at edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--bg-primary)_100%)]" />
    </div>
  );
}
