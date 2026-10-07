import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Engineering Legacy & Production Rigs | Eswari Sound System',
  description:
    'Since 1998, Eswari Sound System has engineered concert-grade sound and lighting for 1,200+ stages across South India. Zero brokers, 100% in-house line arrays.',
};

const PILLARS = [
  {
    number: '01',
    title: 'Matte-black line array stacks',
    desc: 'High-SPL line-array enclosures with neodymium compression drivers, active DSP tuning and cardioid subs — vocals stay intelligible at the back fence of a 100-metre field.',
    specs: '136 dB peak SPL • 110° horizontal dispersion • dual 18" subs',
  },
  {
    number: '02',
    title: 'Stage truss & intelligent lighting',
    desc: 'Certified triangular and square truss loaded with 3200K tungsten PAR cans, moving-head beams and hazers, driven over DMX-512 by our own operator.',
    specs: 'DMX-512 protocol • certified clamps • 3200K warm key wash',
  },
  {
    number: '03',
    title: 'Modular dark walnut stage decks',
    desc: 'Custom 8×16 ft modular decking with non-slip walnut phenolic surface, heavy-gauge steel legs and flame-retardant matte black acoustic wrap.',
    specs: '750 kg/m² safe working load • anti-vibration dampers • modular sizing',
  },
  {
    number: '04',
    title: 'Direct ownership seal',
    desc: 'Mounted on every line-array tower and distribution rack. It marks in-house custody of the equipment, certified electrical grounding and no broker in the chain.',
    specs: 'Direct provider seal • dual surge suppression • isolated earth ground',
  },
];

const MILESTONES = [
  {
    year: '1998',
    title: 'Depot founded',
    desc: 'High-power analog horn systems for temple festivals and cultural mandapams in Madurai.',
  },
  {
    year: '2008',
    title: 'Line arrays',
    desc: 'First in the region to fly modern curve line-array audio for outdoor rallies and weddings.',
  },
  {
    year: '2016',
    title: 'DMX lighting',
    desc: 'Moving heads, digital stage boxes and hazers integrated into unified audio-lighting rigs.',
  },
  {
    year: 'Present',
    title: '1,200+ live stages',
    desc: 'Logistics hubs in Chennai and Madurai, powering touring acts and college festivals.',
  },
];

const GUARANTEES = [
  '100% owned warehouse inventory — no sub-renting',
  'Sound-check three hours before doors, every show',
  'Dual generator isolated clean power distribution',
  'Real-time RF scanning on every wireless channel',
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ink text-white">
      {/* Header — left statement, right meta column */}
      <div className="container-page pt-24 lg:pt-32 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-14 gap-y-8 items-end">
          <div className="lg:col-span-8">
            <span className="label label-amber">
              Established 1998 · Tamil Nadu event production
            </span>
            <h1 className="font-heading text-h1 text-white mt-4">
              Sound engineered by engineers, never brokers
            </h1>
            <p className="mt-5 text-body text-fg-muted leading-relaxed max-w-measure">
              Every rig we send out is ours — bought, maintained and flown by our
 own crew. When an aggregator is hired, up to 40% of the budget disappears
              into middleman markup before a single speaker leaves the warehouse.
              We simply never work that way.
            </p>
          </div>

          <div className="lg:col-span-4 lg:border-l lg:border-white/10 lg:pl-10">
            <div className="border-t border-white/[0.12] pt-4 flex justify-between gap-4 text-spec font-mono">
              <span className="label">Operating since</span>
              <span className="text-amber">1998</span>
            </div>
            <div className="border-t border-white/[0.12] pt-4 mt-4 flex justify-between gap-4 text-spec font-mono">
              <span className="label">Stages built</span>
              <span className="text-amber">1,200+</span>
            </div>
            <div className="border-t border-white/[0.12] pt-4 mt-4 flex justify-between gap-4 text-spec font-mono">
              <span className="label">Depots</span>
              <span className="text-fg-soft">Madurai · Chennai</span>
            </div>
          </div>
        </div>
      </div>

      {/* The direct provider rule */}
      <div className="border-t border-white/[0.12]">
        <div className="container-page section-tight grid grid-cols-1 lg:grid-cols-12 gap-x-14 gap-y-10">
          <div className="lg:col-span-7">
            <span className="label label-amber">The direct provider rule</span>
            <h2 className="font-heading text-h2 text-white mt-3">
              Why we refuse to sub-contract our rigs
            </h2>
            <p className="mt-5 text-body text-fg-muted leading-relaxed max-w-measure">
              Brokers negotiate with whoever answers first — usually low-bid
              technicians carrying worn cables, mismatched speakers and blown
              tweeters. The markup is invisible until the show sounds like it.
            </p>
            <p className="mt-4 text-body text-fg-muted leading-relaxed max-w-measure">
              When you book a stage rig from us, our own fleet transports the
              gear, our own technicians fly the truss, and the senior FOH
              engineer who priced your show stands behind the desk on show
 night. Zero surprises, pure acoustic clarity.
            </p>
          </div>

          <div className="lg:col-span-5 border-l-2 border-amber pl-6">
            <span className="label label-amber">Direct provider guarantees</span>
            <ul className="mt-5 space-y-3.5">
              {GUARANTEES.map((g) => (
                <li key={g} className="marker-dot text-small text-fg-soft">
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Four pillars — outlined numerals on hairlines */}
      <div className="border-t border-white/[0.12]">
        <div className="container-page section-tight">
          <div className="max-w-2xl">
            <span className="label label-amber">Production DNA</span>
            <h2 className="font-heading text-h2 text-white mt-3">
              The four canonical rig pillars
            </h2>
            <p className="mt-4 text-body text-fg-muted leading-relaxed max-w-measure">
              Every stage setup we build starts from these four permanent
              physical pillars.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-14">
            {PILLARS.map((p) => (
              <article key={p.number} className="hairline py-8">
                <div className="flex items-baseline gap-5">
                  <span className="numeral text-h3">{p.number}</span>
                  <h3 className="font-heading text-h4 text-white">{p.title}</h3>
                </div>
                <p className="mt-4 text-small text-fg-muted leading-relaxed max-w-measure">
                  {p.desc}
                </p>
                <p className="mt-4 label label-amber !tracking-[0.1em]">
                  {p.specs}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones — timeline on hairlines */}
      <div className="border-t border-white/[0.12]">
        <div className="container-page section-tight">
          <div className="max-w-2xl">
            <span className="label label-amber">25 years in sound</span>
            <h2 className="font-heading text-h2 text-white mt-3">Our journey</h2>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
            {MILESTONES.map((m) => (
              <div key={m.year} className="border-t border-amber/50 pt-5 pb-8">
                <div className="font-heading text-h2 font-black text-amber tabular-nums">
                  {m.year}
                </div>
                <h4 className="mt-3 font-heading text-base font-bold text-white">
                  {m.title}
                </h4>
                <p className="mt-2 text-small text-fg-muted leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Closing CTA */}
      <div className="border-t border-white/[0.12]">
        <div className="container-page section-tight flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="label label-amber">Instant date lock</span>
            <h2 className="font-heading text-h2 text-white mt-3">
              Ready to power your stage?
            </h2>
            <p className="mt-3 text-body text-fg-muted leading-relaxed max-w-measure">
              Check date availability live, then lock the rig with a 25%
              advance. Balance settles on site after sound-check.
            </p>
          </div>
          <Link href="/book" className="btn-primary shrink-0">
            <span>Check available dates</span>
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
