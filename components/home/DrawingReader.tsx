"use client";

// Hero panel: a P&ID fragment draws itself, a scan line sweeps across, each
// tag gets boxed as the scan passes it & drops into the table below. Pure
// SVG + CSS keyframes (globals.css, "Drawing reader"). Looping is a key that
// remounts the content so every animation restarts. Reduced motion shows the
// finished state with no loop.

import { useEffect, useState } from "react";
import Link from "next/link";

const CYCLE_MS = 9400;
const SCAN_START = 2; // s
const SCAN_DUR = 3.6; // s, sweeps the 600-unit viewBox

const line = "#96B1AD"; // Light Teal
const label = "#F0F2F3";

// Tags in scan order. box = [x, y, w, h] in viewBox units.
const TAGS: { tag: string; type: string; box: [number, number, number, number] }[] = [
  { tag: "150-001-Y30CS", type: "Line", box: [18, 112, 74, 13] },
  { tag: "FCV-204", type: "Valve", box: [96, 149, 42, 13] },
  { tag: "FT-204", type: "Instrument", box: [99, 52, 36, 36] },
  { tag: "V-7207", type: "Equipment", box: [216, 54, 68, 152] },
  { tag: "PT-101", type: "Instrument", box: [232, 6, 36, 36] },
  { tag: "100-002-Y30CS", type: "Line", box: [287, 93, 74, 13] },
  { tag: "P-101", type: "Equipment", box: [386, 138, 48, 64] },
  { tag: "TI-312", type: "Instrument", box: [482, 94, 36, 36] },
  { tag: "100-003-Y30CS", type: "Line", box: [509, 167, 78, 13] },
];

// Each box lands as the scan line reaches its centre.
const hit = ([x, , w]: [number, number, number, number]) =>
  SCAN_START + (SCAN_DUR * (x + w / 2)) / 600 + 0.05;
const DONE = SCAN_START + SCAN_DUR + 0.3;

const d = (s: number) => ({ "--pid-delay": `${s}s` } as React.CSSProperties);

function Bubble({ cx, cy, top, num, delay }: { cx: number; cy: number; top: string; num: string; delay: number }) {
  return (
    <g className="pid-pop" style={d(delay)}>
      <circle cx={cx} cy={cy} r="16" stroke={line} strokeWidth="1.5" fill="none" />
      <line x1={cx - 16} y1={cy} x2={cx + 16} y2={cy} stroke={line} strokeWidth="1" />
      <text className="dr-text" x={cx} y={cy - 4} textAnchor="middle" fill={label}>{top}</text>
      <text className="dr-text" x={cx} y={cy + 11} textAnchor="middle" fill={label}>{num}</text>
    </g>
  );
}

function Cycle() {
  return (
    <div className="dr-cycle">
      <svg viewBox="0 0 600 220" className="w-full h-auto block" aria-hidden="true">
        {/* Pipes */}
        <path className="pid-stroke" style={d(0)} pathLength={1} d="M 0 130 H 105" stroke={line} strokeWidth="2" fill="none" />
        <path className="pid-stroke" style={d(0.25)} pathLength={1} d="M 129 130 H 220" stroke={line} strokeWidth="2" fill="none" />
        <path className="pid-stroke" style={d(0.6)} pathLength={1} d="M 280 110 H 362 V 160 H 392" stroke={line} strokeWidth="2" fill="none" />
        <path className="pid-stroke" style={d(0.95)} pathLength={1} d="M 428 160 H 600" stroke={line} strokeWidth="2" fill="none" />
        <path className="pid-pop" style={d(1.3)} d="M 570 155 l 10 5 -10 5 z" fill={line} />

        {/* Control valve, vessel, pump */}
        <path className="pid-stroke" style={d(0.3)} pathLength={1} d="M 105 118 v 24 l 24 -24 v 24 z" stroke={line} strokeWidth="1.5" fill="none" />
        <rect className="pid-stroke" style={d(0.4)} pathLength={1} x="220" y="60" width="60" height="140" rx="30" stroke={line} strokeWidth="2" fill="none" />
        <circle className="pid-stroke" style={d(0.8)} pathLength={1} cx="410" cy="160" r="18" stroke={line} strokeWidth="2" fill="none" />
        <path className="pid-stroke" style={d(0.95)} pathLength={1} d="M 401 151 L 419 160 L 401 169 Z" stroke={line} strokeWidth="1.5" fill="none" />

        {/* Instrument leads & bubbles */}
        <path className="pid-stroke" style={d(1.0)} pathLength={1} d="M 117 118 V 86" stroke={line} strokeWidth="1" strokeDasharray="3 3" fill="none" />
        <path className="pid-stroke" style={d(1.1)} pathLength={1} d="M 250 60 V 40" stroke={line} strokeWidth="1" strokeDasharray="3 3" fill="none" />
        <path className="pid-stroke" style={d(1.2)} pathLength={1} d="M 500 160 V 128" stroke={line} strokeWidth="1" strokeDasharray="3 3" fill="none" />
        <Bubble cx={117} cy={70} top="FT" num="204" delay={1.3} />
        <Bubble cx={250} cy={24} top="PT" num="101" delay={1.4} />
        <Bubble cx={500} cy={112} top="TI" num="312" delay={1.5} />

        {/* Text tags */}
        <g className="pid-pop" style={d(1.6)}>
          <text className="dr-text" x="55" y="122" textAnchor="middle" fill={label}>150-001-Y30CS</text>
          <text className="dr-text" x="117" y="158" textAnchor="middle" fill={label}>FCV-204</text>
          <text className="dr-text" x="250" y="134" textAnchor="middle" fill={label}>V-7207</text>
          <text className="dr-text" x="324" y="103" textAnchor="middle" fill={label}>100-002-Y30CS</text>
          <text className="dr-text" x="410" y="196" textAnchor="middle" fill={label}>P-101</text>
          <text className="dr-text" x="548" y="177" textAnchor="middle" fill={label}>100-003-Y30CS</text>
        </g>

        {/* Boxes land as the scan passes */}
        {TAGS.map(({ tag, box: [x, y, w, h] }) => (
          <rect key={tag} className="pid-pop" style={d(hit([x, y, w, h]))} x={x} y={y} width={w} height={h} rx="3"
            stroke="#189B93" strokeWidth="1.5" fill="rgba(24,155,147,0.12)" />
        ))}

        {/* Scan line */}
        <g className="dr-scan" style={d(SCAN_START)}>
          <rect x="-24" y="0" width="24" height="220" fill="url(#dr-glow)" />
          <line x1="0" y1="0" x2="0" y2="220" stroke="#189B93" strokeWidth="1.5" />
        </g>
        <defs>
          <linearGradient id="dr-glow" x1="0" x2="1">
            <stop offset="0" stopColor="#189B93" stopOpacity="0" />
            <stop offset="1" stopColor="#189B93" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      {/* Extracted table */}
      <div className="border-t border-[var(--border)] font-mono text-[11px] leading-[18px]">
        <div className="grid grid-cols-[1fr_auto] px-4 py-1 text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
          <span>Tag</span>
          <span>Type</span>
        </div>
        <ul className="px-4 py-1">
          {TAGS.map((t) => (
            <li key={t.tag} className="dr-row grid grid-cols-[1fr_auto]" style={d(hit(t.box))}>
              <span className="text-[var(--text-primary)]">{t.tag}</span>
              <span className="text-[var(--text-secondary)]">{t.type}</span>
            </li>
          ))}
        </ul>
        <p className="pid-pop px-4 py-2 border-t border-[var(--border)] text-[var(--accent-teal)]" style={d(DONE)}>
          9 tags · 3 lines · 2 equipment
        </p>
      </div>
    </div>
  );
}

export default function DrawingReader() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <figure className="w-full lg:w-[520px] shrink-0">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg overflow-hidden shadow-2xl shadow-black/40">
        <div className="flex items-center gap-2 px-4 h-8 border-b border-[var(--border)] font-mono text-[11px] text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-[var(--border)]" />
          <span className="w-2 h-2 rounded-full bg-[var(--border)]" />
          <span className="w-2 h-2 rounded-full bg-[var(--border)]" />
          <span className="ml-2 uppercase tracking-wider">Drawing reader · PID-0412.pdf</span>
        </div>
        <Cycle key={cycle} />
      </div>
      <figcaption className="mt-3 text-xs text-[var(--text-muted)]">
        Tag extraction, illustrated.{" "}
        <Link href="/lab/drawing-intelligence" className="text-[var(--accent-teal)] hover:underline">
          Run your own drawing in the Lab.
        </Link>
      </figcaption>
    </figure>
  );
}
