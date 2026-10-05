import React from 'react';
import Link from 'next/link';
import {
  Volume2,
  ShieldCheck,
  Zap,
  Layers,
  Award,
  Users,
  Radio,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const metadata = {
  title: 'Engineering Legacy & Production Rigs | Eswari Sound System',
  description:
    'Since 1998, Eswari Sound System has engineered concert-grade sound and lighting for 1,200+ stages across South India. Zero brokers, 100% in-house line arrays.',
};

export default function AboutPage() {
  const anchors = [
    {
      number: '01',
      title: 'Matte-Black Line Array Stacks',
      desc: 'High-SPL line-array enclosures featuring neodymium compression drivers, active DSP acoustic tuning, and cardioid subwoofer deployment to project pristine vocal clarity 100+ meters without stage bleed.',
      specs: '136 dB Peak SPL • 110° Horizontal Dispersion • Dual 18" Subwoofers',
    },
    {
      number: '02',
      title: 'Stage Truss & Intelligent Lighting',
      desc: 'Certified heavy-duty triangular and square black box truss loaded with 3200K warm tungsten PAR cans, high-speed moving head beam fixtures, and haze generators synchronized to live performance tempos.',
      specs: 'DMX-512 Protocol • Doughty Certified Clamps • 3200K Warm Key Wash',
    },
    {
      number: '03',
      title: 'Modular Dark Walnut Stage Decks',
      desc: 'Custom-engineered 8x16 ft modular stage decking with non-slip dark walnut phenolic surface, heavy-gauge steel leg supports, and flame-retardant matte black acoustic wrap.',
      specs: '750 kg/m² Safe Working Load • Anti-Vibration Leg Dampers • Modular Sizing',
    },
    {
      number: '04',
      title: 'Signature Direct Ownership Seal',
      desc: 'Mounted on each primary line-array tower and main distribution rack. It signifies direct in-house equipment custody, certified electrical grounding, and zero broker intervention.',
      specs: 'Verified Direct Provider Seal • Dual Surge Suppression • Isolated Earth Ground',
    },
  ];

  const milestones = [
    { year: '1998', title: 'Depot Founded', desc: 'Started with high-power analog horn systems for temple festivals and cultural mandapams in Madurai.' },
    { year: '2008', title: 'Transition to Line Arrays', desc: 'First provider in the region to deploy modern curve line-array audio for large-scale outdoor political rallies and weddings.' },
    { year: '2016', title: 'DMX Lighting Integration', desc: 'Integrated synchronized moving head beams, digital stage boxes, and hazers into unified audio-lighting combos.' },
    { year: 'Present', title: '1,200+ Live Stages', desc: 'Operating full-scale logistics hubs in Chennai and Madurai, powering top South Indian touring acts and college festivals.' },
  ];

  return (
    <div className="min-h-screen bg-ink text-white py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero (No Box UI) */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-24">
        <div className="flex items-center justify-center gap-2 text-amber text-xs font-mono uppercase tracking-[0.25em]">
          <Radio className="w-3.5 h-3.5 text-amber animate-pulse" />
          <span>ESTABLISHED 1998 • TAMIL NADU EVENT PRODUCTION</span>
        </div>

        <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
          Sound Engineered By <br />
          <span className="text-gradient-amber">Engineers, Never Brokers</span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mx-auto pt-2">
          In an industry flooded with event middlemen renting random gear off WhatsApp groups, Eswari Sound System stands as an uncompromising direct provider.
        </p>
      </div>

      {/* The Single Provider Manifesto (Clean Linear Typography, No Box UI) */}
      <div className="border-t border-b border-white/10 py-16 mb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-amber text-xs font-mono uppercase tracking-[0.25em]">
              // THE DIRECT PROVIDER RULE
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              Why We Refuse To Sub-Contract Our Rigs
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              When an event planner hires an aggregator or vendor broker, up to 40% of the budget disappears into middleman markup. The broker then negotiates with low-bid technicians who bring worn cables, mismatched speakers, and blown tweeters.
            </p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              At Eswari Sound System, when you book a stage rig, our own fleet transports the gear, our own technicians fly the truss, and our senior FOH engineer personally balances the acoustic frequencies. Zero surprises. Pure acoustic clarity.
            </p>
          </div>

          <div className="lg:col-span-5 border-l-2 border-amber/60 pl-6 space-y-4">
            <div className="text-amber font-mono text-xs font-bold uppercase tracking-widest">
              Direct Provider Guarantees:
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5 text-white">
                <span className="text-amber font-bold">✓</span>
                <span>100% Owned Warehouse Inventory (No Sub-renting)</span>
              </div>
              <div className="flex items-start gap-2.5 text-white">
                <span className="text-amber font-bold">✓</span>
                <span>Dedicated Sound Check 3 Hours Prior to Event</span>
              </div>
              <div className="flex items-start gap-2.5 text-white">
                <span className="text-amber font-bold">✓</span>
                <span>Dual Generator Isolated Clean Power Distribution</span>
              </div>
              <div className="flex items-start gap-2.5 text-white">
                <span className="text-amber font-bold">✓</span>
                <span>Real-Time RF Wireless Microphone Frequency Scanning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The 4 Production Pillars (Open Layout, No Box UI) */}
      <div className="mb-28">
        <div className="max-w-2xl mb-14">
          <span className="text-amber text-xs font-mono uppercase tracking-[0.25em]">
            // PRODUCTION DNA
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white mt-1">
            The Four Canonical Rig Pillars
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
            Every Eswari stage setup is engineered around these four permanent physical pillars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {anchors.map((a, i) => (
            <div key={i} className="border-t border-white/15 pt-5 space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-amber font-mono text-sm font-bold tracking-wider">
                  {a.number}
                </span>
                <h3 className="font-heading text-xl font-bold text-white">{a.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">{a.desc}</p>
              <div className="text-xs font-mono text-amber pt-1">
                {a.specs}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Milestones (Clean Timeline, No Box UI) */}
      <div className="mb-28 border-t border-white/10 pt-16">
        <div className="max-w-2xl mb-12">
          <span className="text-amber text-xs font-mono uppercase tracking-[0.25em]">
            // 25 YEARS OF ACOUSTIC MASTERY
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Our Journey In Sound
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {milestones.map((m, i) => (
            <div key={i} className="border-t-2 border-amber/60 pt-4">
              <div className="font-heading text-4xl font-black text-amber mb-2">
                {m.year}
              </div>
              <h4 className="font-heading text-base font-bold text-white mb-2">{m.title}</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to action (Clean Typography, No Box UI) */}
      <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Ready To Power Your Stage With Eswari?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1">
            Check date availability instantly and lock your package with a 25% advance.
          </p>
        </div>
        <Link
          href="/book"
          className="px-9 py-4 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shrink-0 shadow-xl shadow-amber/25"
        >
          Check Available Dates
        </Link>
      </div>
    </div>
  );
}
