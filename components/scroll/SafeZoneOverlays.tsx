import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Phone, Clock } from 'lucide-react';
import { formatINR } from '@/lib/utils';

/**
 * Content that sits inside the safe zones of each scrubbed section.
 * Every root carries data-stage-overlay; CanvasScrubber toggles data-edge
 * and --local-p imperatively, so these never re-render while scrolling.
 */

const SHADOW = 'drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]';

const OVERLAY_PACKAGES = [
  {
    name: 'Basic Sound',
    spec: '2 x 500W speakers, wireless mic, 4-channel mixer',
    price: 800000,
  },
  {
    name: 'Premium DJ & Stage',
    spec: '4 x 1000W line arrays, LED pars, fog, sound engineer',
    price: 2500000,
    popular: true,
  },
  {
    name: 'Mega Event Concert',
    spec: '8 x flown line arrays, sub array, 12 moving heads, truss',
    price: 5500000,
  },
];

const SERVICE_ITEMS = [
  {
    num: '01',
    title: 'Flown Line Arrays',
    desc: 'DSP-tuned stacks delivering even response across 10,000+ attendees.',
  },
  {
    num: '02',
    title: 'Concert Lighting',
    desc: 'Moving heads, 3200K tungsten wash and synchronized haze.',
  },
  {
    num: '03',
    title: 'Stage Architecture',
    desc: 'Walnut modular decks up to 60ft with certified safety rails.',
  },
  {
    num: '04',
    title: 'Lead FOH Engineers',
    desc: 'Senior operators on digital consoles and wireless frequency scans.',
  },
];

export function SafeZoneOverlays() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      {/* 01 HOME */}
      <section
        data-stage-overlay
        data-edge="hold"
        className="stage-overlay absolute inset-0 flex items-center justify-center p-6"
        aria-label="Introduction"
      >
        <div className={`w-full max-w-4xl mx-auto text-center space-y-7 ${SHADOW}`}>
          <p className="text-amber text-xs sm:text-sm font-mono uppercase tracking-[0.3em]">
            Direct provider, South India concert rigging
          </p>

          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
            Pure Acoustic Power{' '}
            <span className="text-amber">&amp; Concert Illumination</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-200 leading-relaxed">
            Tour-grade flown line arrays, concert DMX moving heads, and 25 years
            of single-source acoustic mastery. Zero middlemen.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-full bg-amber text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Calendar className="w-4 h-4" aria-hidden />
              <span>Book Stage Rig</span>
            </Link>

            <Link
              href="/packages"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-neutral-200 hover:text-white font-medium text-xs uppercase tracking-widest transition-colors"
            >
              <span>View Packages</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* 02 LEGACY */}
      <section
        data-stage-overlay
        data-edge="hidden"
        className="stage-overlay absolute inset-y-0 left-0 w-full md:w-[52%] flex items-center p-6 sm:p-12 lg:p-16"
        aria-label="Engineering heritage"
      >
        <div className={`space-y-6 max-w-xl ${SHADOW}`}>
          <span className="w-10 h-px bg-amber block" aria-hidden />

          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight">
            Built by sound engineers,{' '}
            <span className="text-amber">never by event brokers.</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
            Middlemen rent whatever a low-bid vendor has spare: blown drivers and
            feedback screech at your biggest moment. Every cabinet, moving head
            and walnut deck we deploy is owned, calibrated and operated by our
            permanent crew.
          </p>

          <ul className="pt-1 space-y-4 border-l-2 border-amber pl-5">
            {[
              ['Line Array Acoustics', 'Flown arrays tuned for even pressure across thousands of attendees.'],
              ['Concert Illumination', 'Truss loaded with 3200K tungsten wash, moving beams and hazers.'],
              ['Heavy-Duty Staging', 'Dark walnut non-slip decks with certified rails and skirting.'],
              ['Certified Reliability', 'Direct engineer dispatch, zero brokerage, zero sub-leasing.'],
            ].map(([label, desc]) => (
              <li key={label}>
                <span className="text-amber font-mono font-bold text-xs uppercase tracking-wider block">
                  {label}
                </span>
                <p className="text-xs sm:text-sm text-neutral-300 mt-0.5">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 03 SERVICES */}
      <section
        data-stage-overlay
        data-edge="hidden"
        className="stage-overlay absolute inset-x-0 bottom-6 sm:bottom-12 flex justify-center px-4 sm:px-8"
        aria-label="Services"
      >
        <div className={`w-full max-w-6xl pb-2 ${SHADOW}`}>
          <div className="text-center mb-6">
            <h3 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">
              Tour-Grade Stage Reinforcement
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-left">
            {SERVICE_ITEMS.map((item) => (
              <div key={item.num} className="border-t border-amber/50 pt-3">
                <span className="text-amber font-mono text-xs font-bold uppercase tracking-wider block mb-1">
                  {item.num} / {item.title}
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 PACKAGES */}
      <section
        data-stage-overlay
        data-edge="hidden"
        className="stage-overlay absolute inset-y-0 right-0 w-full md:w-[48%] flex items-center p-6 sm:p-12 lg:p-16"
        aria-label="Packages"
      >
        <div className={`space-y-6 w-full max-w-lg ${SHADOW}`}>
          <div>
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white">
              Standard Stage Rigs
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-2">
              A 25% advance locks the date. No hidden transport charges inside
              major hubs.
            </p>
          </div>

          <ul className="divide-y divide-white/15">
            {OVERLAY_PACKAGES.map((pkg) => (
              <li key={pkg.name} className="py-3 flex items-baseline justify-between gap-4">
                <div>
                  <span className="font-heading text-base font-bold text-white block">
                    {pkg.name}
                    {pkg.popular && (
                      <span className="ml-2 align-middle text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber text-ink font-bold">
                        Popular
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-neutral-300">{pkg.spec}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-heading text-xl font-bold text-amber block">
                    {formatINR(pkg.price)}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    25% adv: {formatINR(pkg.price * 0.25)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-amber text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <span>Book Stage Rig</span>
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* 05 LIVE STAGE */}
      <section
        data-stage-overlay
        data-edge="hidden"
        className="stage-overlay absolute inset-0 flex items-center justify-center p-6"
        aria-label="Live stage gallery"
      >
        <div className={`max-w-4xl text-center space-y-6 ${SHADOW}`}>
          <h2 className="font-heading text-3xl sm:text-6xl font-black text-white leading-tight">
            High-Impact Live Arenas{' '}
            <span className="text-amber">&amp; Grand Weddings</span>
          </h2>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-neutral-200 leading-relaxed">
            From intimate acoustic mandapams to 12,000-attendee college fests,
            every rig is tuned for intelligibility and punch the crowd remembers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-2 text-sm font-mono text-neutral-300">
            <div>
              <span className="text-amber text-xl font-bold block">130 dB Peak</span>
              <span className="text-xs text-neutral-400">Distortion-free headroom</span>
            </div>
            <div>
              <span className="text-amber text-xl font-bold block">Synchronized DMX</span>
              <span className="text-xs text-neutral-400">Intelligent scene mapping</span>
            </div>
            <div>
              <span className="text-white text-xl font-bold block">4-Hour Deployment</span>
              <span className="text-xs text-neutral-400">Certified rigging crew</span>
            </div>
          </div>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/25 hover:border-amber hover:text-amber text-white font-mono text-xs uppercase tracking-wider transition-colors"
          >
            <span>View Gallery</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </Link>
        </div>
      </section>

      {/* 06 BOOK */}
      <section
        data-stage-overlay
        data-edge="hidden"
        className="stage-overlay absolute inset-0 flex items-center justify-center p-6"
        aria-label="Booking"
      >
        <div className={`max-w-3xl text-center space-y-6 ${SHADOW}`}>
          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            Lock South India&apos;s Most{' '}
            <span className="text-amber">Trusted Stage Rig</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-lg mx-auto">
            Popular wedding and festival dates fill months ahead. Hold our
            line-array rig and lead engineer today with an instant 25% deposit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/book"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-amber text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" aria-hidden />
              <span>Book Stage Rig</span>
            </Link>

            <Link
              href="/inquiry"
              className="w-full sm:w-auto px-8 py-4 text-neutral-200 hover:text-white font-medium text-xs uppercase tracking-widest transition-colors"
            >
              <span>Request a Quote</span>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-mono">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 hover:text-amber transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber" aria-hidden />
              <span>+91 98765 43210</span>
            </a>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden />
              <span>Direct crew dispatch</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
