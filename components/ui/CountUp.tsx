'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  /** The final number (e.g. 1200). */
  to: number;
  /** Rendered before the number, e.g. a currency mark. */
  prefix?: string;
  /** Rendered after the number, e.g. "+" or "%". */
  suffix?: string;
  className?: string;
  duration?: number;
}

/**
 * Counts from 0 to `to` the first time the element scrolls into view.
 * Respects prefers-reduced-motion by rendering the final value immediately.
 */
export function CountUp({
  to,
  prefix = '',
  suffix = '',
  className,
  duration = 1400,
}: CountUpProps) {
  const finalText = `${prefix}${to.toLocaleString('en-IN')}${suffix}`;
  const [text, setText] = useState(finalText);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(finalText);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return;
          started.current = true;
          observer.disconnect();

          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setText(`${prefix}${Math.round(to * eased).toLocaleString('en-IN')}${suffix}`);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [to, prefix, suffix, duration, finalText]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
