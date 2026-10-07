import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    spec: '2 × 500W tops, wireless mic, 4-channel mixer',
    price: 800000,
  },
  {
    name: 'Premium DJ & Stage',
    spec: '4 × 1000W line arrays, LED pars, fog, FOH engineer',
    price: 2500000,
    popular: true,
  },
  {
    name: 'Mega Event Concert',
    spec: '8 flown boxes, sub array, 12 moving heads, truss',
    price: 5500000,
  },
];

const SERVICE_ITEMS = [
  {
    num: '01',
    title: 'Flown line arrays',
    desc: 'DSP-tuned stacks holding even pressure from the front row to the back fence.',
  },
  {
    num: '02',
    title: 'Concert lighting',
    desc: 'Moving heads, 3200K tungsten wash and haze, run over DMX by our operator.',
  },
  {
    num: '03',
    title: 'Stage architecture',
    desc: 'Modular walnut decks to 60ft on steel legs with certified safety rails.',
  },
  {
    num: '04',
    title: 'Lead FOH engineers',
    desc: 'Senior operators on digital consoles, doing the wireless scan before doors.',
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
          <p className="label label-amber !tracking-[0.3em]">
            Madurai &amp; Chennai · owned rigs, own crew, since 1998
          </p>

          <h1 className="font-heading text-display text-white">
            Line arrays, stage truss and lights —{' '}
            <span className="text-amber">run by the people who own them.</span>
          </h1>

          <p className="max-w-measure mx-auto text-body-lg text-fg-soft leading-relaxed">
            Twenty-five years of concert and wedding production across Tamil Nadu.
            One company answers for the audio, the stage and the lighting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-2">
            <Link href="/book" className="btn-primary w-full sm:w-auto">
              Book stage rig
            </Link>

            <Link href="/packages" className="link-arrow !text-[11px]">
              <span>See day rates</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* 02 LEGACY */}
      <section
        data-stage-overlay
        data-edge="hidden"
        className="stage-overlay absolute inset-y-0 left-0 w-full md:w-[54%] flex items-center p-6 sm:p-12 lg:p-16"
        aria-label="Engineering heritage"
      >
        <div className={`space-y-6 max-w-xl ${SHADOW}`}>
          <span className="w-10 h-px bg-amber block" aria-hidden />

          <h2 className="font-heading text-h2 text-white">
            The rig you are quoted is the rig that shows up.
          </h2>

          <p className="text-body text-fg-soft leading-relaxed max-w-measure">
            Brokers sub-let whatever is free that week — blown drivers and feedback
            right at your loudest moment. Every cabinet, moving head and deck we
            deploy is owned, calibrated and operated by our own crew.
          </p>

          <ul className="pt-1">
            {[
              ['Line array acoustics', 'Flown arrays tuned for even pressure across a full field.'],
              ['Concert illumination', 'Truss loaded with 3200K wash, moving beams and hazers.'],
              ['Heavy-duty staging', 'Non-slip decks with certified rails and flame-retardant skirting.'],
              ['Direct dispatch', 'The engineer who quotes the show runs the show.'],
            ].map(([label, desc]) => (
              <li key={label} className="hairline py-3.5 first:border-t-0 first:pt-0">
                <span className="label label-amber">{label}</span>
                <p className="text-small text-fg-muted mt-1">{desc}</p>
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
          <div className="mb-6">
            <span className="label label-amber">What we put on your stage</span>
            <h3 className="font-heading text-h3 text-white mt-2">
              Tour-grade reinforcement, four disciplines
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-left">
            {SERVICE_ITEMS.map((item) => (
              <div key={item.num} className="border-t border-white/25 pt-3">
                <span className="label label-amber block mb-1.5">
                  {item.num} / {item.title}
                </span>
                <p className="text-small text-fg-soft leading-relaxed">{item.desc}</p>
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
            <span className="label label-amber">Day rates</span>
            <h2 className="font-heading text-h2 text-white mt-2">Stage rigs</h2>
            <p className="text-small text-fg-soft mt-2 max-w-measure">
              A 25% advance holds the date. Transport inside Madurai and Chennai
              city limits is already in the price.
            </p>
          </div>

          <ul className="divide-y divide-white/15">
            {OVERLAY_PACKAGES.map((pkg) => (
              <li key={pkg.name} className="py-3.5 flex items-baseline justify-between gap-4">
                <div className="min-w-0">
                  <span className="font-heading text-base font-bold text-white block">
                    {pkg.name}
                    {pkg.popular && (
                      <span className="ml-2 align-middle label !text-[9px] label-amber">
                        Most booked
                      </span>
                    )}
                  </span>
                  <span className="text-small text-fg-muted">{pkg.spec}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-heading text-xl font-bold text-amber block">
                    {formatINR(pkg.price)}
                  </span>
                  <span className="text-[10px] text-fg-muted font-mono">
                    25% adv {formatINR(pkg.price * 0.25)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/book" className="btn-primary">
            Book stage rig
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
          <h2 className="font-heading text-h1 text-white">
            Mandapams, college fests,{' '}
            <span className="text-amber">arena concerts.</span>
          </h2>

          <p className="max-w-measure mx-auto text-body text-fg-soft leading-relaxed">
            From a 300-seat reception to a 12,000-student cultural night, the rig
            is tuned for intelligibility first — so the vows and the headliner are
            both heard at the back.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5 pt-2">
            {[
              ['130 dB peak', 'Headroom without distortion'],
              ['Synchronized DMX', 'Scene-mapped lighting cues'],
              ['4-hour deployment', 'Crew on site, rig up and tuned'],
            ].map(([value, label]) => (
              <div key={value}>
                <span className="font-mono text-lg font-bold text-amber block">{value}</span>
                <span className="label !text-[10px]">{label}</span>
              </div>
            ))}
          </div>

          <Link href="/gallery" className="link-arrow !text-[11px]">
            <span>View live stages</span>
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
          <span className="label label-amber">Pongal, Vaikunta, wedding season</span>
          <h2 className="font-heading text-h1 text-white">
            Popular dates go months ahead.
          </h2>

          <p className="text-body text-fg-soft leading-relaxed max-w-measure mx-auto">
            Hold the line-array rig and the lead engineer with an instant 25%
            deposit. Balance is settled on site, after sound-check, before doors.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-2">
            <Link href="/book" className="btn-primary w-full sm:w-auto">
              Book stage rig
            </Link>

            <Link href="/inquiry" className="link-arrow !text-[11px]">
              <span>Request a quote</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 label">
            <a href="tel:+919876543210" className="link-plain font-mono">
              +91 98765 43210
            </a>
            <span>Depot dispatch, 24/7 during shows</span>
          </div>
        </div>
      </section>
    </div>
  );
}
