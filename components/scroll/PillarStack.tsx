'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Pillar {
  num: string;
  title: string;
  desc: string;
  spec: string;
}

/**
 * Sticky card stack (canonical ScrollTrigger pattern: pin every card except
 * the last at "top top", scale down the card as the next one arrives).
 */
export function PillarStack({ pillars }: { pillars: Pillar[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.stack-card');
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;

        ScrollTrigger.create({
          trigger: card,
          start: 'top top',
          endTrigger: cards[cards.length - 1],
          end: 'top top',
          pin: true,
          pinSpacing: false,
        });

        gsap.to(card, {
          scale: 0.94,
          opacity: 0.4,
          ease: 'none',
          scrollTrigger: {
            trigger: cards[i + 1],
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {pillars.map((pillar) => (
        <div
          key={pillar.num}
          className="stack-card sticky top-0 min-h-[100dvh] flex items-center"
        >
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
              <div className="lg:col-span-4">
                <span className="block font-mono text-amber text-sm font-bold tracking-[0.2em]">
                  {pillar.num}
                </span>
                <span className="block mt-4 h-px w-16 bg-amber/60" aria-hidden />
              </div>

              <div className="lg:col-span-8">
                <h3 className="font-heading text-3xl sm:text-5xl font-extrabold text-white leading-[1.08] tracking-tight">
                  {pillar.title}
                </h3>
                <p className="mt-5 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-[65ch]">
                  {pillar.desc}
                </p>
                <p className="mt-6 font-mono text-xs text-amber tracking-wide">
                  {pillar.spec}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
