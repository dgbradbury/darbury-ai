'use client';

// Animated count-up for the stats strip. Non-numeric values render as-is.
// Respects prefers-reduced-motion (renders the final value immediately).

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export default function StatNumber({ value, className }: { value: string; className?: string }) {
  const target = /^\d+$/.test(value) ? parseInt(value, 10) : null;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState('0');
  // Animation only runs for numeric values, in view, with motion allowed —
  // every other case renders the final value directly.
  const animate = target !== null && !reduceMotion;

  useEffect(() => {
    if (!animate || !inView) return;

    const duration = 1200;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(String(Math.round(eased * target)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, animate]);

  return (
    <div className={className} ref={ref}>
      {animate ? display : value}
    </div>
  );
}
