'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface PanItem {
  src: string;
  alt: string;
  caption: string;
}

/**
 * Horizontal pan (canonical pattern): pin the wrapper at "top top" and scrub
 * the track by its exact horizontal overflow.
 *
 * `panning` is true only while GSAP actually owns the section. When false
 * (mobile, or prefers-reduced-motion), the wrapper becomes a native
 * overflow-x strip with scroll-snap, so nothing is ever clipped.
 */
export function RenderPan({ items }: { items: PanItem[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [panning, setPanning] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      setPanning(true);

      const distance = () => Math.max(1, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onRefreshInit: () => gsap.set(track, { x: 0 }),
        },
      });

      ScrollTrigger.refresh();

      return () => {
        setPanning(false);
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { x: 0, clearProps: 'transform' });
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section aria-label="Stage renders" className="bg-ink">
      <header className="container-page pt-24 lg:pt-32 pb-10">
        <span className="label label-amber">Load-in to load-out</span>
        <h2 className="font-heading text-h2 text-white mt-2">
          One rig, six angles
        </h2>
        <p className="mt-3 text-small sm:text-body text-fg-muted max-w-measure leading-relaxed">
          Stage renders from our production playbook: the same crew, camera
          positions and load-in sequence we run on show day.
        </p>
      </header>

      <div
        ref={wrapRef}
        className={`relative ${
          panning
            ? 'overflow-hidden'
            : 'overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        }`}
        {...(!panning ? { 'data-lenis-prevent': '' } : {})}
      >
        <div
          ref={trackRef}
          className="flex w-max h-[100dvh] items-center gap-6 px-4 sm:px-6 lg:px-8"
        >
          {items.map((item, i) => (
            <figure
              key={item.src}
              className="shrink-0 w-[86vw] sm:w-[64vw] lg:w-[42vw] max-w-[760px] snap-start"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-ink-raised">
                <img
                  src={item.src}
                  alt={item.alt}
                  width={1600}
                  height={1000}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="mt-3 pt-3 hairline flex items-baseline justify-between gap-4 label">
                <span>{item.caption}</span>
                <span className="text-fg-muted">
                  {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
