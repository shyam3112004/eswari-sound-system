'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Radio, Volume2, Sparkles } from 'lucide-react';

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

function pad4(n: number): string {
  return n.toString().padStart(4, '0');
}

interface CanvasScrubberProps {
  onProgress?: (globalProgress: number, activeSection: number, sectionProgress: number) => void;
  children?: React.ReactNode;
}

export function CanvasScrubber({ onProgress, children }: CanvasScrubberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [loadPercent, setLoadPercent] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Cache of loaded HTMLImageElement
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const lastDrawnImage = useRef<HTMLImageElement | null>(null);

  // Scroll interpolation states
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  // Check mobile device breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Frame URL constructor
  const getFrameUrl = useCallback(
    (sectionId: string, frameIndex: number, mobile: boolean) => {
      const folder = mobile ? 'mobile' : 'desktop';
      return `/assets/frames/${folder}/${sectionId}/${pad4(frameIndex)}.webp`;
    },
    []
  );

  // Progressive image preloader
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
      loadedCount++;
      const percent = Math.min(100, Math.round((loadedCount / totalExpectedFrames) * 100));
      setLoadPercent(percent);

      // Once Section 1 (96/64 frames) or 15% is loaded, enable scrubbing immediately
      if (loadedCount >= (isMobile ? 30 : 45) && !isReady) {
        setIsReady(true);
      }
    };

    const loadImage = (url: string): Promise<HTMLImageElement> => {
      if (cache.has(url)) {
        return Promise.resolve(cache.get(url)!);
      }
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

    // Phase A: Preload first 20 frames of Section 1 for instant display
    const firstSection = SECTIONS[0];
    const initialBatch: Promise<any>[] = [];
    const initialCount = Math.min(24, isMobile ? firstSection.mobileFrames : firstSection.desktopFrames);

    for (let i = 1; i <= initialCount; i++) {
      initialBatch.push(loadImage(getFrameUrl(firstSection.id, i, isMobile)));
    }

    Promise.all(initialBatch).then(() => {
      if (!isCancelled) {
        setIsReady(true);

        // Phase B: Preload first frames of all sections for smooth jumping
        SECTIONS.forEach((s) => {
          loadImage(getFrameUrl(s.id, 1, isMobile));
          const maxF = isMobile ? s.mobileFrames : s.desktopFrames;
          loadImage(getFrameUrl(s.id, maxF, isMobile));
        });

        // Phase C: Progressively stream all remaining frames
        let delay = 50;
        SECTIONS.forEach((sec) => {
          const maxF = isMobile ? sec.mobileFrames : sec.desktopFrames;
          for (let f = 1; f <= maxF; f++) {
            const url = getFrameUrl(sec.id, f, isMobile);
            if (!cache.has(url)) {
              setTimeout(() => {
                if (!isCancelled) loadImage(url);
              }, delay);
              delay += 8;
            }
          }
        });
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isMobile, getFrameUrl]);

  // Canvas drawing routine (covers full screen preserving aspect ratio)
  const drawFrame = useCallback((img: HTMLImageElement | null) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

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

  // Window resize handler with DPR scaling
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    if (lastDrawnImage.current) {
      drawFrame(lastDrawnImage.current);
    }
  }, [drawFrame]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Main Animation & Scroll Scrubbing Loop
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = containerRef.current.scrollHeight - window.innerHeight;

      if (totalScrollable <= 0) {
        targetProgress.current = 0;
        return;
      }

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      targetProgress.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const loop = () => {
      // Smooth lerp: current moves 12% towards target per frame
      const diff = targetProgress.current - currentProgress.current;
      currentProgress.current += diff * 0.12;

      const p = Math.max(0, Math.min(0.9999, currentProgress.current));

      // Calculate active section
      const numSections = SECTIONS.length;
      const rawSection = p * numSections;
      const secIdx = Math.floor(rawSection);
      const secProgress = rawSection - secIdx;

      setActiveSectionIndex(secIdx);
      if (onProgress) {
        onProgress(p, secIdx, secProgress);
      }

      // Determine frame number within current section
      const currentSec = SECTIONS[secIdx] || SECTIONS[0];
      const maxFrames = isMobile ? currentSec.mobileFrames : currentSec.desktopFrames;
      const frameNum = Math.min(maxFrames, Math.max(1, Math.floor(secProgress * maxFrames) + 1));

      const frameUrl = getFrameUrl(currentSec.id, frameNum, isMobile);
      const img = imageCache.current.get(frameUrl);

      if (img && img.complete) {
        drawFrame(img);
      } else if (lastDrawnImage.current) {
        // Retain last drawn image to eliminate black flashing
        drawFrame(lastDrawnImage.current);
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isMobile, getFrameUrl, drawFrame, onProgress]);

  // Quick-jump navigation to section
  const scrollToSection = (index: number) => {
    if (!containerRef.current) return;
    const totalScrollable = containerRef.current.scrollHeight - window.innerHeight;
    const targetY = (index / SECTIONS.length) * totalScrollable;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: '600vh' }}>
      {/* Fullscreen Sticky Viewport */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Fullscreen Video Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />

        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70 pointer-events-none -z-5" />
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none -z-5 opacity-60" />

        {/* Loading Progress Bar (if preloading initial assets) */}
        {!isReady && (
          <div className="absolute inset-0 bg-ink z-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber/20 border border-amber/30 flex items-center justify-center text-amber animate-pulse mb-6">
              <Volume2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
              Eswari Sound System
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1 mb-6">
              Calibrating Line Array Acoustics & Stage Lighting Rig...
            </p>
            <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber to-amber-soft transition-all duration-300"
                style={{ width: `${Math.max(8, loadPercent)}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-amber mt-3">
              {loadPercent}% Loaded
            </span>
          </div>
        )}

        {/* Section Quick-Jump Indicator (Desktop Right Side) */}
        <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-3">
          {SECTIONS.map((sec, idx) => {
            const isActive = activeSectionIndex === idx;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(idx)}
                className="group flex items-center justify-end gap-3 focus:outline-none"
                aria-label={`Jump to ${sec.name}`}
              >
                <span
                  className={`text-[11px] font-mono tracking-wider uppercase transition-all opacity-0 group-hover:opacity-100 ${
                    isActive ? 'text-amber opacity-100 font-bold' : 'text-neutral-400'
                  }`}
                >
                  {sec.name}
                </span>
                <span
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-3 h-3 bg-amber shadow-lg shadow-amber/50 scale-125'
                      : 'w-2 h-2 bg-white/30 group-hover:bg-white/70'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Floating Safe-Zone Content Layer */}
        <div className="relative w-full h-full z-20 pointer-events-none">
          {children}
        </div>
      </div>
    </div>
  );
}
