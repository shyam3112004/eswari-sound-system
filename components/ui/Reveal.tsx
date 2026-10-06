'use client';

import React, { useEffect, useRef } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms for siblings inside a group. */
  delay?: number;
  /** Scroll distance in px the element travels while revealing. */
  y?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}

/**
 * Scroll-reveal wrapper. Uses IntersectionObserver (fires once) so it never
 * competes with the scrub loop. Honors prefers-reduced-motion by rendering
 * content immediately.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-revealed');
      return;
    }

    el.style.setProperty('--reveal-delay', `${delay}ms`);
    el.style.setProperty('--reveal-y', `${y}px`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('is-revealed');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, y]);

  return (
    <Tag
      ref={ref as React.RefObject<any>}
      data-reveal=""
      className={className}
    >
      {children}
    </Tag>
  );
}
