'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2 } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToY } from './SmoothScrollProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface SectionMeta {
  id: string;
  name: string;
  label: string;
  desktopFrames: number;
  mobileFrames: number;
}

export const SECTIONS: SectionMeta[] = [
  { id: '01_home', name: 'Home', label: 'Concert Dawn', desktopFrames: 96, mobileFrames: 64 },
  { id: '02_about', name: 'Legacy', label: 'Audio Rigging', desktopFrames: 96, mobileFrames: 64 },
  { id: '03_services', name: 'Services', label: 'Stage Lighting', desktopFrames: 96, mobileFrames: 64 },
  { id: '04_packages', name: 'Packages', label: 'Line Arrays', desktopFrames: 96, mobileFrames: 64 },
  { id: '05_gallery', name: 'Live Stage', label: 'Crowd Immersion', desktopFrames: 96, mobileFrames: 64 },
  { id: '06_book', name: 'Book Rig', label: 'Date Lock', desktopFrames: 96, mobileFrames: 64 },
];

type Edge = 'in' | 'hold' | 'out' | 'hidden';

function pad4(n: number): string {
  return n.toString().padStart(4, '0');
}

interface CanvasScrubberProps {
  children?: React.ReactNode;
}

export function CanvasScrubber({ children }: CanvasScrubberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [loadPercent, setLoadPercent] = useState(0);
  const [isReady, setIsReady] = useState(false);
  // Only ever changes 6 times per full scroll (guarded below), drives the dot rail.
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const lastDrawnUrl = useRef<string>('');
  const lastDrawnImage = useRef<HTMLImageElement | null>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);
  const readyRef = useRef(false);

  // Imperative overlay state: no React render happens per scroll frame.
  const overlayNodes = useRef<HTMLElement[]>([]);
  const overlayState = useRef<{ edge: Edge; local: number }[]>([]);
  const clickableIdx = useRef(-1);
  const lastSectionIdx = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile((prev) => {
      const next = window.innerWidth < 768;
      return prev === next ? prev : next;
    });
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getFrameUrl = useCallback(
    (sectionId: string, frameIndex: number, mobile: boolean) => {
      const folder = mobile ? 'mobile' : 'desktop';
      return `/assets/frames/${folder}/${sectionId}/${pad4(frameIndex)}.webp`;
    },
    []
  );

  // Progressive frame preloader.
  useEffect(() => {
    let isCancelled = false;
    const cache = imageCache.current;

    const totalExpectedFrames = SECTIONS.reduce(
      (sum, s) => sum + (isMobile ? s.mobileFrames : s.desktopFrames),
      0
    );

    let loadedCount = 0;

    const updateProgress = () => {
      if (isCancelled) return;
      loadedCount += 1;
      const percent = Math.min(100, Math.round((loadedCount / totalExpectedFrames) * 100));
      setLoadPercent((prev) => (prev === percent ? prev : percent));

      if (loadedCount >= (isMobile ? 30 : 45) && !readyRef.current) {
        readyRef.current = true;
        setIsReady(true);
      }
    };

    const loadImage = (url: string): Promise<HTMLImageElement> => {
      const cached = cache.get(url);
      if (cached) return Promise.resolve(cached);
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          cache.set(url, img);
          updateProgress();
          resolve(img);
        };
        img.onerror = () => {
          updateProgress();
          resolve(img);
        };
      });
    };

    const firstSection = SECTIONS[0];
    const initialBatch: Promise<HTMLImageElement>[] = [];
    const initialCount = Math.min(
      24,
      isMobile ? firstSection.mobileFrames : firstSection.desktopFrames
    );

    for (let i = 1; i <= initialCount; i += 1) {
      initialBatch.push(loadImage(getFrameUrl(firstSection.id, i, isMobile)));
    }

    Promise.all(initialBatch).then(() => {
      if (isCancelled) return;
      readyRef.current = true;
      setIsReady(true);

      SECTIONS.forEach((s) => {
        loadImage(getFrameUrl(s.id, 1, isMobile));
        const maxF = isMobile ? s.mobileFrames : s.desktopFrames;
        loadImage(getFrameUrl(s.id, maxF, isMobile));
      });

      let delay = 50;
      SECTIONS.forEach((sec) => {
        const maxF = isMobile ? sec.mobileFrames : sec.desktopFrames;
        for (let f = 1; f <= maxF; f += 1) {
          const url = getFrameUrl(sec.id, f, isMobile);
          if (!cache.has(url)) {
            window.setTimeout(() => {
              if (!isCancelled) loadImage(url);
            }, delay);
            delay += 8;
          }
        }
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [isMobile, getFrameUrl]);

  // Canvas draw (cover-fit, DPR aware).
  const drawFrame = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1600;
    const ih = img.naturalHeight || 900;
    const canvasAspect = cw / ch;
    const imgAspect = iw / ih;

    let renderW: number;
    let renderH: number;
    let offsetX: number;
    let offsetY: number;

    if (canvasAspect > imgAspect) {
      renderW = cw;
      renderH = cw / imgAspect;
      offsetX = 0;
      offsetY = (ch - renderH) / 2;
    } else {
      renderH = ch;
      renderW = ch * imgAspect;
      offsetX = (cw - renderW) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
    lastDrawnImage.current = img;
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    lastDrawnUrl.current = '';
    if (lastDrawnImage.current) drawFrame(lastDrawnImage.current);
  }, [drawFrame]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Progress source: ScrollTrigger (works with Lenis and native scroll).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        targetProgress.current = self.progress;
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  // Collect overlay nodes rendered by children (SafeZoneOverlays).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    overlayNodes.current = Array.from(
      container.querySelectorAll<HTMLElement>('[data-stage-overlay]')
    );
    overlayState.current = overlayNodes.current.map(() => ({
      edge: 'hidden' as Edge,
      local: 0,
    }));
    return () => {
      overlayNodes.current = [];
    };
  }, [isReady]);

  // Main scrub loop: lerp progress, draw frames, drive overlays via DOM only.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lerpFactor = reduce ? 1 : 0.14;
    const n = SECTIONS.length;

    const applyOverlays = (p: number) => {
      const nodes = overlayNodes.current;
      if (!nodes.length) return;

      let bestIdx = -1;
      let bestOp = -1;

      for (let i = 0; i < nodes.length; i += 1) {
        // Crossfade windows overlap neighbouring sections by design.
        const start = i === 0 ? 0 : (i - 0.15) / n;
        const full = i === 0 ? 0 : (i + 0.1) / n;
        const dim = i === n - 1 ? 99 : (i + 0.9) / n;
        const end = i === n - 1 ? 99 : (i + 1.15) / n;

        let edge: Edge = 'hidden';
        let local = 0;

        if (p >= start && p < end) {
          if (p < full) {
            edge = 'in';
            local = full === start ? 1 : (p - start) / (full - start);
          } else if (p < dim) {
            edge = 'hold';
            local = 1;
          } else {
            edge = 'out';
            local = (p - dim) / Math.max(end - dim, 1e-6);
          }
        }
        local = Math.min(1, Math.max(0, local));

        const op =
          edge === 'hold' ? 1 : edge === 'in' ? local : edge === 'out' ? 1 - local : 0;
        if (op > bestOp) {
          bestOp = op;
          bestIdx = i;
        }

        const prev = overlayState.current[i];
        if (!prev) continue;
        const localRounded = Math.round(local * 100) / 100;
        if (prev.edge !== edge || prev.local !== localRounded) {
          prev.edge = edge;
          prev.local = localRounded;
          const el = nodes[i];
          el.setAttribute('data-edge', edge);
          if (edge === 'in' || edge === 'out') {
            el.style.setProperty('--local-p', String(localRounded));
          }
        }
      }

      // Focus trap: exactly one overlay accepts pointer + keyboard input.
      // DOM writes only when the dominant overlay actually changes.
      const nextClickable = bestOp > 0.5 ? bestIdx : -1;
      if (nextClickable !== clickableIdx.current) {
        const prevIdx = clickableIdx.current;
        clickableIdx.current = nextClickable;
        if (prevIdx === -1) {
          // First sweep: hidden overlays ship without inert in JSX.
          nodes.forEach((el, idx) => {
            if (idx !== nextClickable) {
              el.setAttribute('inert', '');
              el.setAttribute('aria-hidden', 'true');
            }
          });
        } else if (prevIdx >= 0 && nodes[prevIdx] && prevIdx !== nextClickable) {
          nodes[prevIdx].setAttribute('inert', '');
          nodes[prevIdx].setAttribute('aria-hidden', 'true');
        }
        if (nextClickable >= 0 && nodes[nextClickable]) {
          nodes[nextClickable].removeAttribute('inert');
          nodes[nextClickable].removeAttribute('aria-hidden');
        }
        // Pointer events: every layer above the canvas is pointer-events-none
        // (so the stage stays scrollable and the rail stays clickable). Only
        // the dominant overlay re-enables them, mirroring the inert state.
        nodes.forEach((el, idx) => {
          if (idx === nextClickable) el.setAttribute('data-active', '');
          else el.removeAttribute('data-active');
        });
      }
    };

    const loop = () => {
      const diff = targetProgress.current - currentProgress.current;

      if (Math.abs(diff) < 0.00004) {
        currentProgress.current = targetProgress.current;
      } else {
        currentProgress.current += diff * lerpFactor;
      }

      const p = Math.min(0.999999, Math.max(0, currentProgress.current));

      applyOverlays(p);

      // Section index only re-renders the dot rail when it actually changes.
      const secIdx = Math.min(n - 1, Math.floor(p * n));
      if (secIdx !== lastSectionIdx.current) {
        lastSectionIdx.current = secIdx;
        setActiveSectionIndex(secIdx);
      }

      const currentSec = SECTIONS[secIdx];
      const maxFrames = isMobile ? currentSec.mobileFrames : currentSec.desktopFrames;
      const secProgress = p * n - secIdx;
      const frameNum = Math.min(
        maxFrames,
        Math.max(1, Math.floor(secProgress * maxFrames) + 1)
      );

      const frameUrl = getFrameUrl(currentSec.id, frameNum, isMobile);
      if (frameUrl !== lastDrawnUrl.current) {
        const img = imageCache.current.get(frameUrl);
        if (img && img.complete && img.naturalWidth > 0) {
          lastDrawnUrl.current = frameUrl;
          drawFrame(img);
        } else if (lastDrawnImage.current) {
          // Hold the last good frame to avoid black flashes while streaming.
          drawFrame(lastDrawnImage.current);
        }
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isMobile, getFrameUrl, drawFrame]);

  const scrollToSection = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const totalScrollable = container.scrollHeight - window.innerHeight;
    const n = SECTIONS.length;
    // Land in the middle of the section's hold window (top of page for 0).
    const fraction = index === 0 ? 0 : (index + 0.45) / n;
    scrollToY(container.offsetTop + fraction * totalScrollable);
  };

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: '600vh' }}>
      {/* Fullscreen pinned viewport */}
      <div className="sticky top-0 left-0 w-full h-[100dvh] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70 pointer-events-none z-[1]" />
        <div
          className="absolute inset-0 pointer-events-none z-[1] opacity-70"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 45%, rgba(11,11,15,0.75) 100%)',
          }}
          aria-hidden
        />

        {/* Preloader */}
        {!isReady && (
          <div className="absolute inset-0 bg-ink z-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-11 h-11 rounded-xl border border-white/15 flex items-center justify-center text-amber mb-6">
              <Volume2 className="w-5 h-5 stroke-[1.75]" />
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
              Eswari Sound System
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1 mb-6">
              Loading stage frames
            </p>
            <div className="w-64 max-w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber transition-[width] duration-300"
                style={{ width: `${Math.max(8, loadPercent)}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-amber mt-3">
              {loadPercent}%
            </span>
          </div>
        )}

        {/* Section rail (desktop): absolute, so it leaves with the stage */}
        <div className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3">
          {SECTIONS.map((sec, idx) => {
            const isActive = activeSectionIndex === idx;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(idx)}
                className="group flex items-center justify-end gap-3 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber rounded"
                aria-label={`Jump to ${sec.name}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <span
                  className={`text-[11px] font-mono tracking-wider uppercase transition-opacity duration-200 ${
                    isActive
                      ? 'text-amber opacity-100 font-semibold'
                      : 'text-neutral-400 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                  }`}
                >
                  {sec.name}
                </span>
                <span
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-2.5 h-2.5 bg-amber'
                      : 'w-1.5 h-1.5 bg-white/30 group-hover:bg-white/70'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Overlay content layer */}
        <div className="relative w-full h-full z-20 pointer-events-none" data-ready={isReady ? 'true' : 'false'}>
          {children}
        </div>
      </div>
    </div>
  );
}
