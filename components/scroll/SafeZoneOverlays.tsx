'use client';

import React from 'react';
import Link from 'next/link';
import {
  Volume2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  SlidersHorizontal,
  CheckCircle2,
  Phone,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface SafeZoneOverlaysProps {
  activeSection: number;
  sectionProgress: number;
}

export function SafeZoneOverlays({ activeSection, sectionProgress }: SafeZoneOverlaysProps) {
  // Fade opacity helper based on active section
  const getSectionOpacity = (index: number) => {
    if (activeSection !== index) return 0;
    // Fade in during first 15%, solid in middle, fade out during last 15%
    if (sectionProgress < 0.15) {
      return sectionProgress / 0.15;
    } else if (sectionProgress > 0.85) {
      return (1 - sectionProgress) / 0.15;
    }
    return 1;
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      {/* ========================================================
          SECTION 01: HOME / HERO (Pure Typographic, No Box UI)
         ======================================================== */}
      <div
        className="absolute inset-0 flex items-center justify-center p-6 transition-opacity duration-300"
        style={{
          opacity: getSectionOpacity(0),
          pointerEvents: activeSection === 0 ? 'auto' : 'none',
        }}
      >
        <div className="w-full max-w-4xl mx-auto text-center space-y-7">
          <div className="flex items-center justify-center gap-2 text-amber text-xs sm:text-sm font-mono uppercase tracking-[0.3em] drop-shadow-md">
            <Radio className="w-4 h-4 text-amber animate-pulse" />
            <span>Direct Provider • South India Concert Rigging</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
            Pure Acoustic Power <br />
            <span className="text-gradient-amber">& Concert Illumination</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-200 font-normal leading-relaxed drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
            Zero middlemen. Zero gear shortages. Tour-grade flown line arrays, concert DMX moving heads, and 25 years of single-source acoustic mastery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-3">
            <Link
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-amber/30"
            >
              <Calendar className="w-4 h-4 text-ink" />
              <span>Lock Event Date (25% Advance)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/packages"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-neutral-300 hover:text-white font-medium text-xs uppercase tracking-widest transition-all hover:underline underline-offset-8"
            >
              <span>Explore Gear Specs →</span>
            </Link>
          </div>

          {/* Quick Stats Line (Clean Typography, No Pill/Box Container) */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-mono text-neutral-300 drop-shadow-md">
            <span><strong className="text-amber text-base font-bold">1,200+</strong> Live Stages</span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <span><strong className="text-white text-base font-bold">100%</strong> In-House Gear</span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <span><strong className="text-amber text-base font-bold">0%</strong> Brokerage</span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <span><strong className="text-white text-base font-bold">Permanent</strong> FOH Crew</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 02: ABOUT / LEGACY (Pure Typographic, No Box UI)
         ======================================================== */}
      <div
        className="absolute inset-y-0 left-0 w-full md:w-[52%] flex items-center p-6 sm:p-12 lg:p-16 transition-opacity duration-300"
        style={{
          opacity: getSectionOpacity(1),
          pointerEvents: activeSection === 1 ? 'auto' : 'none',
        }}
      >
        <div className="space-y-6 max-w-xl">
          <div className="flex items-center gap-3 text-amber text-xs font-mono uppercase tracking-[0.25em] drop-shadow-md">
            <span className="w-10 h-[2px] bg-amber inline-block" />
            <span>Engineering Heritage • Est. 1998</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
            Built by Sound Engineers, <br />
            <span className="text-gradient-amber">Never by Event Brokers.</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            Middlemen rent equipment from low-bid vendors, resulting in blown drivers and feedback screech during your biggest moments. At Eswari Sound System, every line-array cabinet, DMX moving head, and walnut stage deck is owned, calibrated, and operated by our permanent crew.
          </p>

          {/* Clean, attractive specifications with zero box UI */}
          <div className="pt-2 space-y-4 border-l-2 border-amber/60 pl-5">
            <div>
              <span className="text-amber font-mono font-bold text-xs uppercase tracking-wider block drop-shadow-sm">
                Line Array Acoustics
              </span>
              <p className="text-xs sm:text-sm text-neutral-300 drop-shadow-sm mt-0.5">
                Matte-black high-output flown arrays tuned for even pressure across thousands of attendees.
              </p>
            </div>
            <div>
              <span className="text-amber font-mono font-bold text-xs uppercase tracking-wider block drop-shadow-sm">
                Concert Illumination
              </span>
              <p className="text-xs sm:text-sm text-neutral-300 drop-shadow-sm mt-0.5">
                Black aluminium truss loaded with 3200K tungsten wash, moving beams, and hazers.
              </p>
            </div>
            <div>
              <span className="text-amber font-mono font-bold text-xs uppercase tracking-wider block drop-shadow-sm">
                Heavy-Duty Staging
              </span>
              <p className="text-xs sm:text-sm text-neutral-300 drop-shadow-sm mt-0.5">
                Dark walnut non-slip stage platforms with certified safety rails and acoustic skirting.
              </p>
            </div>
            <div>
              <span className="text-amber font-mono font-bold text-xs uppercase tracking-wider block drop-shadow-sm">
                Certified Reliability
              </span>
              <p className="text-xs sm:text-sm text-neutral-300 drop-shadow-sm mt-0.5">
                Direct audio engineer dispatch with zero equipment brokerage and zero sub-leasing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 03: SERVICES / GEAR (Pure Typographic, No Box UI)
         ======================================================== */}
      <div
        className="absolute inset-x-0 bottom-6 sm:bottom-12 flex justify-center px-4 sm:px-8 transition-opacity duration-300"
        style={{
          opacity: getSectionOpacity(2),
          pointerEvents: activeSection === 2 ? 'auto' : 'none',
        }}
      >
        <div className="w-full max-w-6xl pb-2">
          <div className="text-center mb-6">
            <span className="text-amber text-xs font-mono uppercase tracking-[0.25em] drop-shadow-md">
              // COMPLETE IN-HOUSE GEAR DEPLOYMENT
            </span>
            <h3 className="font-heading text-2xl sm:text-4xl font-extrabold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] mt-1">
              Tour-Grade Stage Reinforcement
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-left">
            <div className="border-t border-amber/40 pt-3">
              <span className="text-amber font-mono text-xs font-bold uppercase tracking-wider block mb-1">
                01 / Flown Line Arrays
              </span>
              <h4 className="font-heading text-base font-bold text-white mb-1 drop-shadow-md">
                JBL & L-Acoustics Spec
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed drop-shadow-sm">
                Active DSP tuning delivering uniform frequency response across 10,000+ outdoor attendees.
              </p>
            </div>

            <div className="border-t border-amber/40 pt-3">
              <span className="text-amber font-mono text-xs font-bold uppercase tracking-wider block mb-1">
                02 / Concert Lighting
              </span>
              <h4 className="font-heading text-base font-bold text-white mb-1 drop-shadow-md">
                Intelligent DMX Rigs
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed drop-shadow-sm">
                Moving heads, 3200K tungsten stage wash, sharp beam fixtures, and synchronized haze machines.
              </p>
            </div>

            <div className="border-t border-amber/40 pt-3">
              <span className="text-amber font-mono text-xs font-bold uppercase tracking-wider block mb-1">
                03 / Stage Architecture
              </span>
              <h4 className="font-heading text-base font-bold text-white mb-1 drop-shadow-md">
                Walnut Modular Decks
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed drop-shadow-sm">
                Heavy-duty certified stage platforms up to 60ft width with safety rails and flame-retardant skirting.
              </p>
            </div>

            <div className="border-t border-amber/40 pt-3">
              <span className="text-amber font-mono text-xs font-bold uppercase tracking-wider block mb-1">
                04 / Audio Engineers
              </span>
              <h4 className="font-heading text-base font-bold text-white mb-1 drop-shadow-md">
                Lead FOH Mix Operators
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed drop-shadow-sm">
                Senior live sound engineers managing multi-track digital consoles and wireless frequency scanning.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 04: PACKAGES (Pure Typographic, No Box UI)
         ======================================================== */}
      <div
        className="absolute inset-y-0 right-0 w-full md:w-[48%] flex items-center p-6 sm:p-12 lg:p-16 transition-opacity duration-300"
        style={{
          opacity: getSectionOpacity(3),
          pointerEvents: activeSection === 3 ? 'auto' : 'none',
        }}
      >
        <div className="space-y-6 w-full max-w-lg">
          <div>
            <span className="text-amber text-xs font-mono uppercase tracking-[0.25em] drop-shadow-md">
              // TRANSPARENT DAY RATES
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white mt-1 drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
              Standard Stage Rigs
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 drop-shadow-sm">
              Instant 25% advance secures date. Zero hidden transport charges within major hubs.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-white/15">
            <div className="pt-2 flex items-baseline justify-between">
              <div>
                <span className="font-heading text-base font-bold text-white block drop-shadow-sm">
                  Basic Sound Package
                </span>
                <span className="text-xs text-neutral-300">2x 500W Speakers, 1 Wireless Mic, 4ch Mixer</span>
              </div>
              <div className="text-right ml-4">
                <span className="font-heading text-xl font-bold text-amber">₹8,000</span>
                <span className="text-[10px] text-neutral-400 block font-mono">25% Adv: ₹2,000</span>
              </div>
            </div>

            <div className="pt-4 flex items-baseline justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-base font-bold text-white drop-shadow-sm">
                    Premium DJ & Stage Rig
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber text-ink font-bold">
                    Popular
                  </span>
                </div>
                <span className="text-xs text-neutral-300">4x 1000W Line Arrays, LED Pars, Fog, Sound Engineer</span>
              </div>
              <div className="text-right ml-4">
                <span className="font-heading text-xl font-bold text-amber">₹25,000</span>
                <span className="text-[10px] text-neutral-400 block font-mono">25% Adv: ₹6,250</span>
              </div>
            </div>

            <div className="pt-4 flex items-baseline justify-between">
              <div>
                <span className="font-heading text-base font-bold text-white block drop-shadow-sm">
                  Mega Event Concert Rig
                </span>
                <span className="text-xs text-neutral-300">8x Flown Line Arrays, Sub Array, 12x Moving Heads, Truss</span>
              </div>
              <div className="text-right ml-4">
                <span className="font-heading text-xl font-bold text-amber">₹55,000</span>
                <span className="text-[10px] text-neutral-400 block font-mono">25% Adv: ₹13,750</span>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-amber/25"
            >
              <span>Reserve Rig With 25% Advance</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 05: GALLERY (Pure Typographic, No Box UI)
         ======================================================== */}
      <div
        className="absolute inset-0 flex items-center justify-center p-6 transition-opacity duration-300"
        style={{
          opacity: getSectionOpacity(4),
          pointerEvents: activeSection === 4 ? 'auto' : 'none',
        }}
      >
        <div className="max-w-4xl text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-amber text-xs font-mono uppercase tracking-[0.25em] drop-shadow-md">
            <Sparkles className="w-4 h-4 text-amber" />
            <span>Visual Production Heritage</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-6xl font-black text-white leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
            High-Impact Live Arenas & <br />
            <span className="text-gradient-amber">Grand Weddings</span>
          </h2>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-neutral-200 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            From intimate acoustic mandapams to 12,000+ attendee college cultural music fests, our stage setups deliver crystal intelligibility and punch that attendees remember.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-4 text-sm font-mono text-neutral-300 drop-shadow-md">
            <div>
              <span className="text-amber text-xl font-bold block">130 dB Peak</span>
              <span className="text-xs text-neutral-400">Distortion-Free Headroom</span>
            </div>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <div>
              <span className="text-amber text-xl font-bold block">Synchronized DMX</span>
              <span className="text-xs text-neutral-400">Intelligent Scene Mapping</span>
            </div>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <div>
              <span className="text-white text-xl font-bold block">4-Hour Deployment</span>
              <span className="text-xs text-neutral-400">Certified Rigging Crew</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-all border border-white/20"
            >
              <span>Explore High-Resolution Live Stage Gallery</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 06: BOOK / CONTACT (Pure Typographic, No Box UI)
         ======================================================== */}
      <div
        className="absolute inset-0 flex items-center justify-center p-6 transition-opacity duration-300"
        style={{
          opacity: getSectionOpacity(5),
          pointerEvents: activeSection === 5 ? 'auto' : 'none',
        }}
      >
        <div className="max-w-3xl text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-amber text-xs font-mono uppercase tracking-[0.25em] drop-shadow-md">
            <Calendar className="w-4 h-4 text-amber" />
            <span>Instant Date Reservation</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
            Lock South India’s Most <br />
            <span className="text-gradient-amber">Trusted Stage Rig</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-lg mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
            Popular wedding and festival dates fill up months in advance. Lock our line-array rig and lead audio engineer today with an instant 25% deposit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              href="/book"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-2xl shadow-amber/30 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Stage Rig Now</span>
            </Link>

            <Link
              href="/inquiry"
              className="w-full sm:w-auto px-8 py-4 text-neutral-300 hover:text-white font-medium text-xs uppercase tracking-widest transition-all hover:underline underline-offset-8"
            >
              <span>Request Custom Festival Quote →</span>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-mono">
            <a href="tel:+919876543210" className="flex items-center gap-1.5 hover:text-amber transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber" />
              <span>Direct Operations Line: +91 98765 43210</span>
            </a>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-amber" />
              <span>Direct Crew Dispatch</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
