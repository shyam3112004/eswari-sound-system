'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Package,
  Plus,
  Minus,
  ShoppingCart,
  Wrench,
  Lightbulb,
  Cpu,
  Wind,
  Battery,
  X,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  audio: <Volume2 className="w-3.5 h-3.5" />,
  lighting: <Lightbulb className="w-3.5 h-3.5" />,
  staging: <Layers className="w-3.5 h-3.5" />,
  effects: <Wind className="w-3.5 h-3.5" />,
  power: <Battery className="w-3.5 h-3.5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  audio: 'text-amber',
  lighting: 'text-yellow-400',
  staging: 'text-haze',
  effects: 'text-purple-400',
  power: 'text-emerald-400',
};

export default function PackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'packages' | 'materials'>('packages');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [materialsCategoryFilter, setMaterialsCategoryFilter] = useState<string>('all');

  // Materials rental state: { [materialId]: quantity }
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    // Check if URL has ?tab=materials
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'materials') {
        setActiveTab('materials');
      }
    }

    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPackages(data.packages);
      })
      .catch((err) => console.error('Failed to load packages:', err))
      .finally(() => setLoading(false));

    fetch('/api/materials')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMaterials(data.materials);
      })
      .catch((err) => console.error('Failed to load materials:', err))
      .finally(() => setMaterialsLoading(false));
  }, []);

  const packageCategories = [
    { id: 'all', label: 'All Event Rigs' },
    { id: 'custom', label: '🛠️ Custom Packages' },
    { id: 'audio', label: 'Audio Only' },
    { id: 'lighting', label: 'Stage Lighting' },
    { id: 'combo', label: 'Audio + Lighting Combos' },
  ];

  const filteredPackages =
    activeCategory === 'all'
      ? packages
      : activeCategory === 'custom'
      ? packages.filter((p) => p.slug === 'custom-rig' || p.category === 'custom')
      : packages.filter((p) => p.category === activeCategory);

  // Materials grouping
  const materialCategories = [...new Set(materials.map((m) => m.category))];

  const cartTotal = Object.entries(cart).reduce((acc, [id, qty]) => {
    const material = materials.find((m) => m.id === id);
    return acc + (material ? material.pricePerDay * qty : 0);
  }, 0);

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const handleBookCustomPackage = () => {
    const selectedList = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const m = materials.find((x) => x.id === id);
        return {
          material: m,
          quantity: qty,
        };
      })
      .filter((item) => item.material);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('customPackageMaterials', JSON.stringify(selectedList));
    }
    router.push('/book?package=custom-rig');
  };

  const setQty = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const clearCart = () => setCart({});

  // Build WhatsApp inquiry message from cart
  const buildInquiryMessage = () => {
    const lines = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const m = materials.find((m) => m.id === id);
        if (!m) return '';
        return `• ${m.name} × ${qty} ${m.unit} = ${formatINR(m.pricePerDay * qty)}/day`;
      })
      .filter(Boolean);

    return encodeURIComponent(
      `Hi Eswari Sound System, I'd like to rent the following materials:\n\n${lines.join('\n')}\n\nTotal: ${formatINR(cartTotal)}/day\n\nPlease confirm availability and provide a full quote.`
    );
  };

  return (
    <div className="min-h-screen bg-ink text-white py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="flex items-center justify-center gap-2 text-amber text-xs font-mono uppercase tracking-[0.25em]">
          <ShieldCheck className="w-3.5 h-3.5 text-amber" />
          <span>DIRECT PROVIDER • 100% IN-HOUSE INVENTORY</span>
        </div>

        <h1 className="font-heading text-4xl sm:text-6xl font-black text-white tracking-tight">
          Concert-Grade Stage <span className="text-gradient-amber">Rigs &amp; Day Rates</span>
        </h1>

        <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-2xl mx-auto">
          Zero hidden fees. Lock your desired date with an instant 25% deposit. Remaining balance is settled on-site post acoustic sound-check.
        </p>

        {/* Main Tab Switch: Packages / Materials Rent */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'packages'
                ? 'bg-amber text-ink font-bold shadow-lg shadow-amber/25'
                : 'text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Stage Packages</span>
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'materials'
                ? 'bg-amber text-ink font-bold shadow-lg shadow-amber/25'
                : 'text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Materials Rent</span>
            {cartItemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-ink text-amber border border-amber text-[10px] font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── TAB: FULL PACKAGES ─── */}
      {activeTab === 'packages' && (
        <>
          {/* Category Filter Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            {packageCategories.map((c) => {
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

          {loading ? (
            <div className="py-24 text-center text-neutral-400 font-mono text-xs">
              Loading production packages catalog...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-28">
              {filteredPackages.map((pkg) => {
                const isCustom = pkg.slug === 'custom-rig';

                if (isCustom) {
                  return (
                    <div
                      key={pkg.id}
                      className="border-t-2 border-haze/60 hover:border-haze pt-6 flex flex-col justify-between transition-colors duration-300 relative"
                    >
                      <div className="absolute -top-3 right-0">
                        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-haze/20 border border-haze/40 text-haze font-bold">
                          Build Your Own
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-mono text-haze uppercase tracking-wider font-semibold">
                            custom • pick any gear
                          </span>
                        </div>

                        <h2 className="font-heading text-2xl font-bold text-white mb-2">
                          {pkg.name}
                        </h2>

                        <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
                          {pkg.description}
                        </p>

                        <div className="border-t border-white/10 pt-4 mb-6">
                          <div className="flex items-baseline gap-2">
                            <span className="font-heading text-2xl sm:text-3xl font-extrabold text-haze">
                              You Choose
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 mt-2 font-mono">
                            Total depends on selected items. 25% advance on confirmed total.
                          </div>
                        </div>

                        <div className="space-y-3 mb-8">
                          <div className="text-[11px] font-mono uppercase tracking-wider text-haze font-semibold">
                            How It Works:
                          </div>
                          {pkg.features.map((f: string, fi: number) => (
                            <div key={fi} className="flex items-start gap-2.5 text-xs text-neutral-300">
                              <CheckCircle2 className="w-4 h-4 text-haze shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 space-y-2">
                        <Link
                          href="/book?package=custom-rig"
                          className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 transition-all bg-haze/10 border border-haze/40 text-haze hover:bg-haze/20 hover:border-haze"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Build & Book Custom Rig</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setActiveTab('materials')}
                          className="w-full py-2.5 rounded-full text-xs font-mono text-neutral-400 hover:text-white text-center transition-colors"
                        >
                          Browse materials catalog first →
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
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
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── TAB: MATERIALS RENT ─── */}
      {activeTab === 'materials' && (
        <div className="space-y-8 mb-20">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-xs font-mono text-amber uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Wrench className="w-3.5 h-3.5" />
              <span>BUILD YOUR OWN RIG • DAILY RENTAL RATES</span>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Select individual materials to rent for your event. Mix and match speakers, lights, effects, and power units. Our team delivers, rigs, and retrieves everything.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Materials Catalog */}
            <div className="lg:col-span-2 space-y-6">
              {/* Material Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-white/10">
                <button
                  onClick={() => setMaterialsCategoryFilter('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                    materialsCategoryFilter === 'all'
                      ? 'bg-amber text-ink font-bold shadow-md shadow-amber/20'
                      : 'text-neutral-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  All Items ({materials.length})
                </button>
                {materialCategories.map((cat) => {
                  const icon = CATEGORY_ICONS[cat] || <Package className="w-3.5 h-3.5" />;
                  const count = materials.filter((m) => m.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setMaterialsCategoryFilter(cat)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                        materialsCategoryFilter === cat
                          ? 'bg-amber text-ink font-bold shadow-md shadow-amber/20'
                          : 'text-neutral-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {icon}
                      <span className="capitalize">{cat}</span>
                      <span className="opacity-70 text-[10px]">({count})</span>
                    </button>
                  );
                })}
              </div>

              {materialsLoading ? (
                <div className="py-16 text-center text-neutral-400 font-mono text-xs">
                  Loading materials catalog...
                </div>
              ) : materials.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 font-mono text-xs">
                  No materials available yet. Check back soon or contact us for custom quotes.
                </div>
              ) : (
                materialCategories
                  .filter((cat) => materialsCategoryFilter === 'all' || cat === materialsCategoryFilter)
                  .map((cat) => {
                  const catMaterials = materials.filter((m) => m.category === cat);
                  const icon = CATEGORY_ICONS[cat] || <Package className="w-3.5 h-3.5" />;
                  const colorClass = CATEGORY_COLORS[cat] || 'text-neutral-300';
                  return (
                    <div key={cat}>
                      {/* Category Header */}
                      <div className={`flex items-center gap-2 mb-4 ${colorClass}`}>
                        {icon}
                        <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-bold">
                          {cat.charAt(0).toUpperCase() + cat.slice(1)} Equipment
                        </span>
                        <div className="flex-1 border-t border-white/10" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {catMaterials.map((m) => {
                          const qty = cart[m.id] || 0;
                          return (
                            <div
                              key={m.id}
                              className={`p-5 rounded-2xl border transition-all ${
                                qty > 0
                                  ? 'border-amber/60 bg-amber/5 shadow-lg shadow-amber/10'
                                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-heading text-sm font-bold text-white truncate">
                                    {m.name}
                                  </h3>
                                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed line-clamp-2">
                                    {m.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <div>
                                  <span className="font-heading text-base font-bold text-amber">
                                    {formatINR(m.pricePerDay)}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 font-mono ml-1">
                                    / {m.unit} / day
                                  </span>
                                </div>

                                {/* Quantity Control */}
                                <div className="flex items-center gap-2">
                                  {qty > 0 ? (
                                    <>
                                      <button
                                        onClick={() => setQty(m.id, -1)}
                                        className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-neutral-300 hover:border-red-400/50 hover:text-red-400 transition-colors"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-7 text-center font-mono text-sm font-bold text-amber">
                                        {qty}
                                      </span>
                                      <button
                                        onClick={() => setQty(m.id, 1)}
                                        className="w-7 h-7 rounded-full border border-amber/40 bg-amber/10 flex items-center justify-center text-amber hover:bg-amber/20 transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => setQty(m.id, 1)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-[11px] font-mono text-neutral-300 hover:border-amber/50 hover:text-amber hover:bg-amber/5 transition-all"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Add</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {qty > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                                  <span className="text-neutral-400">Subtotal ({qty} {m.unit}):</span>
                                  <span className="text-amber font-bold">{formatINR(m.pricePerDay * qty)}/day</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart / Summary Sidebar */}
            <div className="space-y-4">
              <div className="sticky top-24">
                <div className="glass-card-amber rounded-3xl p-6 border border-amber/30 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-amber" />
                      <span>Rental Summary</span>
                    </h3>
                    {cartItemCount > 0 && (
                      <button
                        onClick={clearCart}
                        className="flex items-center gap-1 text-[11px] font-mono text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  {cartItemCount === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <Package className="w-10 h-10 text-neutral-600 mx-auto" />
                      <p className="text-xs text-neutral-500 font-mono">
                        No items selected yet. Add materials from the catalog.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 border-y border-white/10 py-4 max-h-64 overflow-y-auto">
                        {Object.entries(cart)
                          .filter(([, qty]) => qty > 0)
                          .map(([id, qty]) => {
                            const m = materials.find((x) => x.id === id);
                            if (!m) return null;
                            return (
                              <div key={id} className="flex items-start justify-between gap-2 text-xs">
                                <div className="flex-1 min-w-0">
                                  <div className="text-neutral-200 font-medium truncate">{m.name}</div>
                                  <div className="text-neutral-500 font-mono">
                                    {qty} {m.unit} × {formatINR(m.pricePerDay)}
                                  </div>
                                </div>
                                <div className="text-amber font-mono font-bold shrink-0">
                                  {formatINR(m.pricePerDay * qty)}
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-amber font-mono">Total / Day:</span>
                          <span className="font-mono font-extrabold text-amber">{formatINR(cartTotal)}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          Final quote depends on event duration and delivery zone. Contact us to confirm.
                        </p>
                      </div>
                    </>
                  )}

                  {cartItemCount > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <button
                        onClick={handleBookCustomPackage}
                        className="w-full py-4 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink font-bold text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-amber/25 transition-all cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book as Custom Rig ({formatINR(cartTotal)}/day)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '919876543210'}?text=${buildInquiryMessage()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-full glass-card border border-white/20 text-neutral-200 hover:text-white text-xs font-mono uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all hover:bg-white/10"
                      >
                        <span>Request Rental Quote on WhatsApp</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>

                      <Link
                        href="/inquiry"
                        className="w-full py-2.5 rounded-full border border-white/10 text-neutral-400 hover:text-white text-xs font-mono uppercase tracking-wider text-center flex items-center justify-center gap-2 hover:border-white/20 transition-all"
                      >
                        <span>Submit Formal Proposal</span>
                      </Link>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px] text-neutral-400 font-mono">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>All gear is 100% in-house</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber" />
                      <span>Delivery, rigging &amp; retrieval included</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Concert Inquiry Banner */}
      <div className="border-t border-white/10 pt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-amber text-xs font-mono uppercase tracking-[0.2em]">
            <Sparkles className="w-4 h-4 text-amber" />
            <span>CUSTOM ACOUSTIC MODELING &amp; MULTI-DAY FESTIVALS</span>
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
