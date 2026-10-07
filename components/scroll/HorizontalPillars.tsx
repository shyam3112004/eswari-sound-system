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
 * "Zero Compromise Hardware" — pinned horizontal scroll.
 *
 * Desktop (≥768px, reduced-motion off): the section is pinned by ScrollTrigger
 * while the track translates X by scroll progress. Only the track's transform
 * changes every frame — the counter, progress bar and active-card dimming are
 * written straight to the DOM, never through React state.
 *
 * Mobile (<768px): no pin. The same track becomes a native overflow-x scroller
 * with scroll-snap (Lenis is told to leave it alone).
 *
 * prefers-reduced-motion: plain vertical stack, zero animation.
 */
export function HorizontalPillars({ pillars }: { pillars: Pillar[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.dataset.reduced = reduced ? 'true' : 'false';

    // Only the mobile native scroller should be exempt from Lenis — on desktop
    // the pinned track is not scrollable and must stay Lenis-smooth.
    if (!reduced && window.innerWidth < 768) {
      track.setAttribute('data-lenis-prevent', '');
    }

    const applyState = (progress: number) => {
      const p = Math.min(1, Math.max(0, progress));
      const idx = Math.min(pillars.length - 1, Math.round(p * (pillars.length - 1)));

      if (counterRef.current) {
        const text = `${String(idx + 1).padStart(2, '0')} / ${String(pillars.length).padStart(2, '0')}`;
        if (counterRef.current.textContent !== text) counterRef.current.textContent = text;
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }

      const cards = Array.from(track.querySelectorAll<HTMLElement>('.pillar-panel'));
      cards.forEach((card, i) => {
        const active = i === idx;
        if ((card.dataset.active === 'true') !== active) {
          card.dataset.active = active ? 'true' : 'false';
        }
      });
    };

    if (!reduced) {
      // Native horizontal swipe fallback (mobile): drive counter/active from the
      // scroller itself. Lenis never touches it (data-lenis-prevent attribute).
      track.addEventListener('scroll', () => {
        const max = track.scrollWidth - track.clientWidth;
        if (max > 0) applyState(track.scrollLeft / max);
      });
    }

    applyState(0);

    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => Math.max(1, track.scrollWidth - window.innerWidth);

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => applyState(self.progress),
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { x: 0, clearProps: 'transform' });
      };
    });

    return () => mm.revert();
  }, [pillars.length]);

  return (
    <section ref={rootRef} aria-label="Production standards" className="relative bg-ink">
      <div className="pillar-stage">
        {/* Header stays visible at the top while the section is pinned */}
        <header className="w-full container-page pt-16 lg:pt-20 pb-8">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div className="max-w-2xl">
              <span className="label label-amber">Owned · calibrated · crewed</span>
              <h2 className="font-heading text-h2 text-white mt-2">
                Zero Compromise Hardware
              </h2>
              <p className="mt-3 text-small sm:text-body text-fg-muted max-w-measure leading-relaxed">
                Every cabinet, fixture and deck in the Ponmeni depot is owned and
                calibrated in-house. Four things hold up every show we run.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 pb-2">
              <span
                ref={counterRef}
                className="font-mono text-xs label-amber tracking-[0.2em] font-bold"
                aria-live="polite"
              >
                01 / {String(pillars.length).padStart(2, '0')}
              </span>
              <div className="relative w-28 sm:w-44 h-px bg-white/15 overflow-hidden" aria-hidden>
                <div
                  ref={barRef}
                  className="absolute inset-y-0 left-0 w-full bg-amber origin-left"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Horizontal track — translateX driven by scroll on desktop,
            native overflow-x + snap on mobile, vertical stack when reduced. */}
        <div ref={trackRef} className="pillar-track">
          {pillars.map((pillar, i) => (
            <article
              key={pillar.num}
              className="pillar-panel"
              data-active={i === 0 ? 'true' : 'false'}
            >
              <span
                className="numeral pillar-num block select-none"
                aria-hidden
              >
                {pillar.num}
              </span>

              <h3 className="mt-6 font-heading text-h2 text-white">
                {pillar.title}
              </h3>

              <p className="mt-4 text-body text-fg-soft leading-relaxed max-w-measure">
                {pillar.desc}
              </p>

              <p className="pillar-spec font-mono text-spec text-amber tracking-wide">
                {pillar.spec}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
