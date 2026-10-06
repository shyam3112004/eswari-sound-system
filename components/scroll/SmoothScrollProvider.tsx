'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

let lenisRef: Lenis | null = null;

/** Programmatic scroll that goes through Lenis when it is active. */
export function scrollToY(y: number) {
  if (lenisRef) {
    lenisRef.scrollTo(y, { duration: 1.1 });
  } else {
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reduced motion: native scroll, ScrollTrigger still works without smoothing.
    let lenis: Lenis | null = null;
    if (!reduce) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
      });
      lenisRef = lenis;
      lenis.on('scroll', ScrollTrigger.update);
    }

    const raf = (time: number) => {
      lenis?.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Anchor links (footer, nav) must go through Lenis too.
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest?.('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      scrollToY(target.getBoundingClientRect().top + window.scrollY - 80);
    };
    document.addEventListener('click', onAnchorClick);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('click', onAnchorClick);
      window.removeEventListener('resize', onResize);
      gsap.ticker.remove(raf);
      lenis?.destroy();
      lenisRef = null;
      started.current = false;
    };
  }, []);

  return <>{children}</>;
}
