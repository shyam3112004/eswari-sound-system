import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CinematicStage } from '@/components/scroll/CinematicStage';
import { SmoothScrollProvider } from '@/components/scroll/SmoothScrollProvider';
import { HorizontalPillars } from '@/components/scroll/HorizontalPillars';
import { RenderPan } from '@/components/scroll/RenderPan';
import { Reveal } from '@/components/ui/Reveal';
import { CountUp } from '@/components/ui/CountUp';
import { getAllPackages } from '@/lib/db';
import { formatINR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATS = [
  { to: 1200, suffix: '+', label: 'Live stages since 1998' },
  { to: 100, suffix: '%', label: 'In-house owned gear' },
  { to: 0, suffix: '%', label: 'Brokerage or sub-leasing' },
  { to: 24, suffix: '/7', label: 'Event technical support' },
];

const PILLARS = [
  {
    num: '01',
    title: 'High-output line arrays',
    desc: 'Matte-black 4-to-16 cabinet stacks over dual 18-inch ground subs, tuned for open-ground crowd penetration. Active DSP keeps vocals intelligible at the back fence of a 10,000-person field.',
    spec: '136 dB peak SPL • 110° horizontal dispersion • dual 18" subs',
  },
  {
    num: '02',
    title: 'Intelligent lighting',
    desc: 'Aluminium truss carrying a 3200K tungsten key wash, sharp moving heads and synchronised hazers, driven over DMX-512 by our own operator — not a playlist on a laptop.',
    spec: 'DMX-512 protocol • certified clamps • 3200K warm key wash',
  },
  {
    num: '03',
    title: 'Modular stage decks',
    desc: 'Modular 8×16ft to 40×60ft dark walnut non-slip platforms on steel legs, finished with certified safety rails, flame-retardant skirting and anti-vibration dampers.',
    spec: '750 kg/m² safe working load • modular sizing • safety rails',
  },
  {
    num: '04',
    title: 'Permanent crew',
    desc: 'Direct dispatch of audio technicians, digital mixer operators and a lead FOH engineer. The people who priced your show are the people standing behind the desk on show night.',
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

        {/* Stat band — open grid, hairline dividers only */}
        <section aria-label="Key figures" className="border-t border-white/[0.12]">
          <div className="container-page grid grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 80}
                className={[
                  'py-10 lg:py-14',
                  i % 2 === 1 ? 'pl-5 sm:pl-7 border-l border-white/10' : '',
                  i >= 2 ? 'border-t border-white/10 lg:border-t-0' : '',
                  i > 0 ? 'lg:border-l lg:border-white/10 lg:pl-7' : '',
                ].join(' ')}
              >
                <div className="font-heading text-4xl sm:text-5xl font-black text-amber tracking-tight tabular-nums">
                  <CountUp to={stat.to} suffix={stat.suffix} />
                </div>
                <div className="mt-3 label max-w-[22ch]">{stat.label}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Stage packages — hairline rows, no cards */}
        <section aria-label="Stage packages" className="container-page section">
          <Reveal className="max-w-2xl">
            <span className="label label-amber">Day rates · 25% advance locks the date</span>
            <h2 className="font-heading text-h1 text-white mt-3">Stage Rigs, Day Rates</h2>
            <p className="mt-4 text-body text-fg-muted leading-relaxed max-w-measure">
              Fixed packages for the shows we run most. The advance goes on the
              operations calendar the moment it clears; the balance is settled
              on site after sound-check.
            </p>
          </Reveal>

          <div className="mt-14">
            {/* Featured rig */}
            {featured && (
              <Reveal
                as="article"
                className="hairline py-10 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                <div className="lg:col-span-7">
                  <span className="label label-amber">
                    {featured.category} · most booked
                  </span>
                  <h3 className="font-heading text-h3 text-white mt-3">
                    {featured.name}
                  </h3>
                  <p className="mt-3 text-body text-fg-muted leading-relaxed max-w-measure">
                    {featured.description}
                  </p>

                  <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2.5">
                    {featured.features.slice(0, 6).map((f) => (
                      <li key={f} className="marker-dot text-small text-fg-soft">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-5 lg:pl-10 lg:border-l lg:border-white/10 flex flex-col justify-between gap-6">
                  <div>
                    <div className="font-heading text-4xl sm:text-5xl font-black text-amber tabular-nums">
                      {formatINR(featured.price)}
                    </div>
                    <div className="mt-2 label">Per event day</div>
                    <div className="mt-6 space-y-1.5 font-mono text-spec text-fg-muted">
                      <div className="flex justify-between gap-4">
                        <span>25% advance</span>
                        <span className="text-fg-soft">{formatINR(featured.price * 0.25)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Balance on site</span>
                        <span className="text-fg-soft">{formatINR(featured.price * 0.75)}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/book?package=${featured.slug}`} className="btn-primary">
                    Book stage rig
                  </Link>
                </div>
              </Reveal>
            )}

            {/* Supporting rows */}
            {rest.map((pkg, i) => (
              <Reveal
                key={pkg.id}
                as="article"
                delay={(i + 1) * 90}
                className="hairline py-7 grid grid-cols-1 sm:grid-cols-12 gap-x-8 gap-y-3 items-baseline"
              >
                <h3 className="sm:col-span-4 font-heading text-h4 text-white">
                  {pkg.name}
                </h3>
                <p className="sm:col-span-5 text-small text-fg-muted leading-relaxed">
                  {pkg.description}
                </p>
                <div className="sm:col-span-3 flex items-baseline justify-between sm:justify-end gap-6">
                  <span className="font-mono text-lg font-bold text-amber tabular-nums">
                    {formatINR(pkg.price)}
                  </span>
                  <Link href={`/book?package=${pkg.slug}`} className="link-arrow">
                    <span>Book</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120} className="mt-10">
            <Link href="/packages" className="link-arrow">
              <span>All packages &amp; day rates</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </Reveal>
        </section>

        {/* Production pillars: pinned horizontal scroll */}
        <section
          aria-label="Production standards"
          className="border-t border-white/[0.12] bg-ink"
        >
          <HorizontalPillars pillars={PILLARS} />
        </section>

        {/* Horizontal render pan */}
        <RenderPan items={PAN_ITEMS} />

        {/* Closing CTA */}
        <section aria-label="Booking" className="border-t border-white/[0.12]">
          <div className="container-page section grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            <Reveal className="lg:col-span-7">
              <span className="label label-amber">Instant date lock</span>
              <h2 className="font-heading text-h1 text-white mt-3">
                Reserve the rig with 25% advance
              </h2>
              <p className="mt-4 text-body text-fg-muted leading-relaxed max-w-measure">
                Dates lock on our operations calendar as soon as the advance
                clears. Balance is paid on site, after sound-check, before doors.
              </p>
            </Reveal>

            <Reveal delay={100} className="lg:col-span-5 lg:border-l lg:border-white/10 lg:pl-16">
              <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-6">
                <Link href="/book" className="btn-primary w-full sm:w-auto lg:w-full">
                  Book stage rig
                </Link>
                <Link href="/inquiry" className="link-arrow">
                  <span>Request a quote</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
              </div>
              <a
                href="tel:+919876543210"
                className="mt-7 block font-mono text-spec text-fg-muted hover:text-amber transition-colors"
              >
                Depot line · +91 98765 43210
              </a>
            </Reveal>
          </div>
        </section>
      </div>
    </SmoothScrollProvider>
  );
}
