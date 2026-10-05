'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Volume2,
  Zap,
  Layers,
  SlidersHorizontal,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPackages(data.packages);
        }
      })
      .catch((err) => console.error('Failed to load packages:', err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: 'all', label: 'All Event Rigs' },
    { id: 'audio', label: 'Audio Only' },
    { id: 'lighting', label: 'Stage Lighting' },
    { id: 'combo', label: 'Audio + Lighting Combos' },
  ];

  const filteredPackages =
    activeCategory === 'all'
      ? packages
      : packages.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-ink text-white py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header (No Box UI) */}
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <div className="flex items-center justify-center gap-2 text-amber text-xs font-mono uppercase tracking-[0.25em]">
          <ShieldCheck className="w-3.5 h-3.5 text-amber" />
          <span>DIRECT PROVIDER • 100% IN-HOUSE INVENTORY</span>
        </div>

        <h1 className="font-heading text-4xl sm:text-6xl font-black text-white tracking-tight">
          Concert-Grade Stage <span className="text-gradient-amber">Rigs & Day Rates</span>
        </h1>

        <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-2xl mx-auto">
          Zero hidden fees. Lock your desired date with an instant 25% deposit. Remaining balance is settled on-site post acoustic sound-check.
        </p>

        {/* Category Filter Links (Clean, No Box UI) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          {categories.map((c) => {
            const isActive = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-amber text-ink font-bold shadow-lg shadow-amber/25'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Packages Grid (Clean Open Columns, No Box UI) */}
      {loading ? (
        <div className="py-24 text-center text-neutral-400 font-mono text-xs">
          Loading production packages catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-28">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="border-t-2 border-white/20 hover:border-amber pt-6 flex flex-col justify-between transition-colors duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-amber uppercase tracking-wider font-semibold">
                    {pkg.category} • In-House Gear
                  </span>
                  {pkg.isPopular && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber text-ink font-bold">
                      Most Requested
                    </span>
                  )}
                </div>

                <h2 className="font-heading text-2xl font-bold text-white mb-2">
                  {pkg.name}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
                  {pkg.description}
                </p>

                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading text-3xl sm:text-4xl font-extrabold text-amber">
                      {formatINR(pkg.price)}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">/ event day</span>
                  </div>
                  <div className="text-xs text-neutral-300 mt-2 flex items-center justify-between font-mono">
                    <span>Deposit to lock date (25%):</span>
                    <span className="text-white font-bold">
                      {formatINR(pkg.price * 0.25)}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between font-mono">
                    <span>Balance on-site (75%):</span>
                    <span>
                      {formatINR(pkg.price * 0.75)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-amber font-semibold">
                    Package Inclusions:
                  </div>
                  {pkg.features.map((f: string, fi: number) => (
                    <div key={fi} className="flex items-start gap-2.5 text-xs text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Link
                  href={`/book?package=${pkg.slug}`}
                  className={`w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all ${
                    pkg.isPopular
                      ? 'bg-gradient-to-r from-amber to-amber-soft text-ink hover:brightness-110 shadow-lg shadow-amber/25'
                      : 'border border-white/20 text-white hover:border-amber hover:text-amber'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reserve Rig (25% Advance)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Concert Inquiry Banner (Open Typography, No Box UI) */}
      <div className="border-t border-white/10 pt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-amber text-xs font-mono uppercase tracking-[0.2em]">
            <Sparkles className="w-4 h-4 text-amber" />
            <span>CUSTOM ACOUSTIC MODELING & MULTI-DAY FESTIVALS</span>
          </div>
          <h3 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">
            Need A 16-Box Line Array Or Custom Truss Architecture?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            For college cultural festivals, arena tour stops, or multi-day temple celebrations, we provide customized sound modeling, dual power backup systems, and dedicated FOH/monitor audio teams.
          </p>
        </div>

        <Link
          href="/inquiry"
          className="shrink-0 px-9 py-4 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-amber/25"
        >
          Request Custom Proposal
        </Link>
      </div>
    </div>
  );
}
