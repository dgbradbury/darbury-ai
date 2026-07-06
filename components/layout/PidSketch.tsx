// Animated P&ID fragment for the hero — pipes, a vessel, a pump & instrument
// bubbles draw themselves in (stroke-dashoffset animation, keyframes in
// globals.css), then AI "tags" pop onto the components. Pure SVG + CSS, no
// client JS. prefers-reduced-motion renders it fully drawn, static.
//
// Every path uses pathLength={1} so one shared dasharray works for all.

// Dark-teal, low-contrast tones — the sketch must sit clearly behind the
// hero text, not compete with it.
const stroke = "rgba(51,75,73,0.35)";
const strokeSoft = "rgba(51,75,73,0.25)";
const tagFill = "rgba(24,155,147,0.18)";

// Draw delay (s) helper — sets the CSS var the keyframe classes read.
const d = (s: number) => ({ "--pid-delay": `${s}s` } as React.CSSProperties);

export default function PidSketch() {
  return (
    <svg
      viewBox="0 0 1200 520"
      className="pid-sketch absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* ── Pipes ── */}
      {/* Inlet line to valve, then vessel */}
      <path className="pid-stroke" style={d(0)} pathLength={1} d="M 0 260 H 218" stroke={stroke} strokeWidth="2.5" fill="none" />
      <path className="pid-stroke" style={d(0.35)} pathLength={1} d="M 262 260 H 460" stroke={stroke} strokeWidth="2.5" fill="none" />
      {/* Vessel outlet to pump */}
      <path className="pid-stroke" style={d(0.9)} pathLength={1} d="M 572 230 H 700 V 300 H 784" stroke={stroke} strokeWidth="2.5" fill="none" />
      {/* Pump discharge */}
      <path className="pid-stroke" style={d(1.4)} pathLength={1} d="M 856 300 H 1200" stroke={stroke} strokeWidth="2.5" fill="none" />
      {/* Flow arrow */}
      <path className="pid-pop" style={d(1.9)} d="M 1080 292 l 16 8 -16 8 z" fill={stroke} />

      {/* ── Control valve (bowtie) ── */}
      <path className="pid-stroke" style={d(0.5)} pathLength={1} d="M 218 248 v 24 l 44 -24 v 24 z" stroke={stroke} strokeWidth="2" fill="none" />

      {/* ── Vessel ── */}
      <rect className="pid-stroke" style={d(0.6)} pathLength={1} x="460" y="140" width="112" height="240" rx="56" stroke={stroke} strokeWidth="2.5" fill="none" />

      {/* ── Pump ── */}
      <circle className="pid-stroke" style={d(1.2)} pathLength={1} cx="820" cy="300" r="36" stroke={stroke} strokeWidth="2.5" fill="none" />
      <path className="pid-stroke" style={d(1.45)} pathLength={1} d="M 802 282 L 838 300 L 802 318 Z" stroke={stroke} strokeWidth="2" fill="none" />

      {/* ── Instrument bubbles with dashed signal leads ── */}
      <path className="pid-stroke" style={d(1.6)} pathLength={1} d="M 240 234 V 176" stroke={strokeSoft} strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      <circle className="pid-pop" style={d(1.9)} cx="240" cy="148" r="27" stroke={stroke} strokeWidth="2" fill="none" />
      <text className="pid-pop pid-tag-text" style={d(2.05)} x="240" y="153" textAnchor="middle" fill={tagFill}>FT-204</text>

      <path className="pid-stroke" style={d(1.7)} pathLength={1} d="M 516 140 V 96" stroke={strokeSoft} strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      <circle className="pid-pop" style={d(2.1)} cx="516" cy="68" r="27" stroke={stroke} strokeWidth="2" fill="none" />
      <text className="pid-pop pid-tag-text" style={d(2.25)} x="516" y="73" textAnchor="middle" fill={tagFill}>PT-101</text>

      <path className="pid-stroke" style={d(1.8)} pathLength={1} d="M 980 300 V 232" stroke={strokeSoft} strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      <circle className="pid-pop" style={d(2.3)} cx="980" cy="204" r="27" stroke={stroke} strokeWidth="2" fill="none" />
      <text className="pid-pop pid-tag-text" style={d(2.45)} x="980" y="209" textAnchor="middle" fill={tagFill}>TI-312</text>

      {/* ── AI-extracted equipment tags ── */}
      <text className="pid-pop pid-tag-text" style={d(2.6)} x="516" y="265" textAnchor="middle" fill={tagFill}>V-7207</text>
      <text className="pid-pop pid-tag-text" style={d(2.75)} x="820" y="368" textAnchor="middle" fill={tagFill}>P-101 A/B</text>
      <text className="pid-pop pid-tag-text" style={d(2.9)} x="360" y="248" textAnchor="middle" fill={tagFill}>150-001-Y30CS</text>
    </svg>
  );
}
