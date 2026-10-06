import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { CinematicStage } from '@/components/scroll/CinematicStage';
import { SmoothScrollProvider } from '@/components/scroll/SmoothScrollProvider';
import { PillarStack } from '@/components/scroll/PillarStack';
import { RenderPan } from '@/components/scroll/RenderPan';
import { Reveal } from '@/components/ui/Reveal';
import { getAllPackages } from '@/lib/db';
import { formatINR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATS = [
  { value: '1,200+', label: 'Live stages since 1998' },
  { value: '100%', label: 'In-house owned gear' },
  { value: '0%', label: 'Brokerage or sub-leasing' },
  { value: '24/7', label: 'Event technical support' },
];

const PILLARS = [
  {
    num: '01',
    title: 'High-Output Line Arrays',
    desc: 'Matte-black 4-to-16 cabinet line-array stacks with dual 18-inch ground subwoofers, tuned for outdoor crowd penetration. Active DSP tuning keeps vocal clarity even at the back of a 10,000-person field.',
    spec: '136 dB peak SPL • 110° horizontal dispersion • dual 18" subs',
  },
  {
    num: '02',
    title: 'Intelligent Lighting',
    desc: 'Heavy-duty aluminium truss loaded with 3200K tungsten stage wash, sharp moving heads and synchronized hazers, all driven over DMX-512 by our own operator.',
    spec: 'DMX-512 protocol • certified clamps • 3200K warm key wash',
  },
  {
    num: '03',
    title: 'Modular Stage Decks',
    desc: 'Modular 8x16ft to 40x60ft dark walnut non-slip platforms on steel legs, finished with certified safety rails, flame-retardant skirting and anti-vibration dampers.',
    spec: '750 kg/m² safe working load • modular sizing • safety rails',
  },
  {
    num: '04',
    title: 'Permanent Crew',
    desc: 'Direct dispatch of dedicated audio technicians, digital mixer operators and a lead FOH engineer. The people who quote your show are the people who run it.',
    spec: 'Zero equipment brokerage • zero sub-leasing • direct dispatch',
  },
];

const PAN_ITEMS = [
  { section: '01_home', caption: 'Concert dawn' },
  { section: '02_about', caption: 'Audio rigging' },
  { section: '03_services', caption: 'Stage lighting' },
  { section: '04_packages', caption: 'Line arrays' },
  { section: '05_gallery', caption: 'Crowd immersion' },
  { section: '06_book', caption: 'Date lock' },
].map(({ section, caption }) => ({
  src: `/assets/frames/desktop/${section}/0048.webp`,
  alt: `${caption} stage render`,
  caption,
}));

export default async function HomePage() {
  const packages = await getAllPackages();
  const featured = packages.find((p) => p.isPopular) ?? packages[0];
  const rest = packages.filter((p) => p.id !== featured?.id).slice(0, 3);

  return (
    <SmoothScrollProvider>
      {/* -mt-16 cancels main's pt-16 so the pinned stage bleeds full-height
          under the transparent navbar at scroll position 0. */}
      <div className="relative bg-ink text-white -mt-16">
        {/* Pinned cinematic stage: 6 sections x 96 frames, scrubbed by scroll */}
        <CinematicStage />

        {/* Stat band */}
        <section
          aria-label="Key figures"
          className="border-y border-white/10 bg-ink-raised"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/10">
            {STATS.map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 80}
                className="px-4 sm:px-8 py-10 lg:py-14 first:border-l-0"
              >
                <div className="font-heading text-4xl sm:text-5xl font-black text-amber tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400 leading-relaxed">
                  {stat.label}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Packages: featured + supporting, asymmetric (no equal card row) */}
        <section
          aria-label="Stage packages"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32"
        >
          <Reveal className="max-w-2xl">
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Stage Rigs, Day Rates
            </h2>
            <p className="mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-[65ch]">
              A 25% advance locks the date on our operations calendar. Balance is
              settled on-site after sound-check.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Featured */}
            {featured && (
              <Reveal className="lg:col-span-7">
                <article className="h-full flex flex-col rounded-card border border-amber/30 bg-ink-raised p-7 sm:p-9">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-amber">
                      {featured.category}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-amber text-ink font-bold">
                      Most booked
                    </span>
                  </div>

                  <h3 className="mt-5 font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {featured.name}
                  </h3>
                  <p className="mt-3 text-sm text-neutral-400 leading-relaxed max-w-[60ch]">
                    {featured.description}
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {featured.features.slice(0, 5).map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm text-neutral-300"
                      >
                        <CheckCircle2
                          className="w-4 h-4 text-amber shrink-0 mt-0.5"
                          aria-hidden
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-end justify-between gap-5">
                    <div>
                      <div className="font-mono text-3xl sm:text-4xl font-bold text-amber">
                        {formatINR(featured.price)}
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-neutral-500">
                        per event day · 25% advance{' '}
                        {formatINR(featured.price * 0.25)}
                      </div>
                    </div>
                    <Link
                      href={`/book?package=${featured.slug}`}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      <span>Book Stage Rig</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </Link>
                  </div>
                </article>
              </Reveal>
            )}

            {/* Supporting list */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {rest.map((pkg, i) => (
                <Reveal key={pkg.id} delay={(i + 1) * 90} className="flex-1">
                  <article className="h-full flex flex-col rounded-card border border-white/10 bg-ink-raised p-6 sm:p-7 hover:border-white/25 transition-colors">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-heading text-lg font-bold text-white">
                        {pkg.name}
                      </h3>
                      <span className="font-mono text-lg font-bold text-amber whitespace-nowrap">
                        {formatINR(pkg.price)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
                      {pkg.description}
                    </p>
                    <div className="mt-auto pt-5">
                      <Link
                        href={`/book?package=${pkg.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-300 hover:text-amber transition-colors"
                      >
                        <span>Book Stage Rig</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={120} className="mt-10">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-300 hover:text-amber transition-colors"
            >
              <span>View Packages</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber" aria-hidden />
            </Link>
          </Reveal>
        </section>

        {/* Production pillars: sticky scroll stack */}
        <section
          aria-label="Production standards"
          className="border-t border-white/10 bg-ink"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
            <Reveal>
              <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Zero Compromise Hardware
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-[65ch] leading-relaxed">
                Every cabinet, fixture and deck in our depot is owned and
                calibrated in-house. Four pillars hold up every show we run.
              </p>
            </Reveal>
          </div>
          <PillarStack pillars={PILLARS} />
        </section>

        {/* Horizontal render pan */}
        <RenderPan items={PAN_ITEMS} />

        {/* Closing CTA */}
        <section
          aria-label="Booking"
          className="border-t border-white/10 bg-ink-raised"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            <Reveal className="lg:col-span-7">
              <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.08]">
                Reserve your concert rig with 25% advance
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-[60ch]">
                Dates lock instantly on our operations calendar. The balance is
                paid on-site, after sound-check, before doors.
              </p>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-5">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                <Link
                  href="/book"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-amber text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <span>Book Stage Rig</span>
                </Link>
                <Link
                  href="/inquiry"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 text-neutral-200 hover:border-amber hover:text-amber font-semibold text-xs uppercase tracking-widest transition-colors"
                >
                  <span>Request a Quote</span>
                </Link>
              </div>
              <a
                href="tel:+919876543210"
                className="mt-5 flex items-center justify-center gap-2 font-mono text-xs text-neutral-500 hover:text-amber transition-colors"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden />
                <span>+91 98765 43210</span>
              </a>
            </Reveal>
          </div>
        </section>
      </div>
    </SmoothScrollProvider>
  );
}
