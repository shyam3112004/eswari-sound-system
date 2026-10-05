import React from 'react';
import Link from 'next/link';
import { CinematicStage } from '@/components/scroll/CinematicStage';
import { SmoothScrollProvider } from '@/components/scroll/SmoothScrollProvider';
import { 
  Volume2, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Calendar, 
  ArrowRight, 
  SlidersHorizontal,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { getAllPackages } from '@/lib/db';
import { formatINR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const packages = await getAllPackages();

  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen bg-ink text-white">
        {/* ========================================================
            PINNED CINEMATIC CANVAS SCRUBBER STAGE (576 FRAMES LOOP)
            Sections: 01 Home -> 02 About -> 03 Services -> 
                      04 Packages -> 05 Gallery -> 06 Book
            Pure typography, zero box UI
           ======================================================== */}
        <CinematicStage />

        {/* ========================================================
            TECHNICAL SPECIFICATIONS & GEAR BREAKDOWN (NO BOX UI)
           ======================================================== */}
        <div className="relative z-30 bg-ink border-t border-white/10 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
            <span className="text-amber text-xs font-mono uppercase tracking-[0.25em]">
              // LIVE STAGE ACOUSTIC ENGINEERING
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Tour-Grade Sound Reinforcement
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed max-w-xl mx-auto">
              Every speaker cabinet, digital mixer, and DMX light in our depot is owned and calibrated in-house. We do not broker. We deploy.
            </p>
          </div>

          {/* Clean Editorial Packages Grid (No Box UI) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-28">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="border-t border-white/20 hover:border-amber pt-6 flex flex-col justify-between transition-colors duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber font-semibold">
                      {pkg.category}
                    </span>
                    {pkg.isPopular && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-ink bg-amber px-2 py-0.5 rounded-full font-bold">
                        Most Booked
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading text-xl font-bold text-white mb-2">
                    {pkg.name}
                  </h3>

                  <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="border-t border-white/10 pt-4 mb-6">
                    <span className="font-heading text-3xl font-extrabold text-amber">
                      {formatINR(pkg.price)}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono ml-2">/ event day</span>
                    <div className="text-[11px] text-neutral-400 mt-1 font-mono">
                      25% Lock Deposit: <span className="text-white font-bold">{formatINR(pkg.price * 0.25)}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-8">
                    {pkg.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-2.5 text-xs text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/book?package=${pkg.slug}`}
                  className={`w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all ${
                    pkg.isPopular
                      ? 'bg-gradient-to-r from-amber to-amber-soft text-ink hover:brightness-110 shadow-lg shadow-amber/25'
                      : 'border border-white/20 text-white hover:border-amber hover:text-amber'
                  }`}
                >
                  <span>Book This Rig</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Technical Production Standards (Clean Open Typography, No Box UI) */}
          <div className="mb-24 pt-10 border-t border-white/10">
            <div className="max-w-2xl mb-12">
              <span className="text-amber text-xs font-mono uppercase tracking-[0.25em]">
                // PRODUCTION ARCHITECTURE
              </span>
              <h3 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-1">
                Zero Compromise Hardware Specs
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                Our stage visual signature is engineered around 4 standardized, heavy-duty production pillars.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="border-t-2 border-amber/60 pt-4">
                <span className="text-amber font-mono text-xs font-bold uppercase tracking-wider block mb-1">
                  01 / High-Output Line Arrays
                </span>
                <h4 className="font-heading text-base font-bold text-white mb-2">Flown Arena Audio</h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Matte-black 4-to-16 cabinet line-array stacks with dual 18-inch ground subwoofers tuned for outdoor crowd penetration.
                </p>
              </div>

              <div className="border-t-2 border-amber/60 pt-4">
                <span className="text-amber font-mono text-xs font-bold uppercase tracking-wider block mb-1">
                  02 / Intelligent Lighting
                </span>
                <h4 className="font-heading text-base font-bold text-white mb-2">Stage Truss & Beams</h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Heavy-duty aluminium truss loaded with 3200K tungsten stage wash, sharp moving heads, and synchronized hazers.
                </p>
              </div>

              <div className="border-t-2 border-amber/60 pt-4">
                <span className="text-amber font-mono text-xs font-bold uppercase tracking-wider block mb-1">
                  03 / Modular Stage Decks
                </span>
                <h4 className="font-heading text-base font-bold text-white mb-2">Dark Walnut Platforms</h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Modular 8x16ft to 40x60ft dark walnut non-slip stage platforms finished with certified safety rails and black skirting.
                </p>
              </div>

              <div className="border-t-2 border-amber/60 pt-4">
                <span className="text-amber font-mono text-xs font-bold uppercase tracking-wider block mb-1">
                  04 / Permanent Crew
                </span>
                <h4 className="font-heading text-base font-bold text-white mb-2">Lead Sound Engineers</h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Direct dispatch of dedicated audio technicians and digital mixer operators with zero equipment brokerage.
                </p>
              </div>
            </div>
          </div>

          {/* Booking CTA Section (Clean Floating Typography, No Box UI) */}
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl">
              <span className="text-amber text-xs font-mono uppercase tracking-[0.25em]">
                // DIRECT PROVIDER ASSURANCE
              </span>
              <h3 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">
                Reserve Your Concert Rig With 25% Advance
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Dates are locked on our operations calendar immediately. Remaining balance is paid on-site post sound-check.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
              <Link
                href="/book"
                className="px-9 py-4 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all text-center shadow-2xl shadow-amber/25"
              >
                Instant Date Booking
              </Link>
              <Link
                href="/inquiry"
                className="px-8 py-4 rounded-full border border-white/20 hover:border-amber text-white hover:text-amber font-medium text-xs uppercase tracking-widest transition-all text-center"
              >
                Custom Festival Quote
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SmoothScrollProvider>
  );
}
