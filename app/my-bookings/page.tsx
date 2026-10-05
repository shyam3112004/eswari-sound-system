'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Calendar,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CreditCard,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

function MyBookingsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length < 3) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/my-bookings?query=${encodeURIComponent(searchTerm.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to lookup bookings');
      }

      setBookings(data.bookings);
    } catch (err: any) {
      setError(err.message || 'Lookup failed');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="min-h-screen bg-ink text-white py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-amber/30 text-amber text-xs font-mono uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-amber" />
          <span>Customer Order Tracker</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-black text-white tracking-tight">
          Track Your <span className="text-gradient-amber">Booking & Stage Rig</span>
        </h1>

        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Enter the 10-digit mobile number or email address used during booking to check your confirmation call status and payment receipts.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-16">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter mobile (e.g. 9876543210) or email..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-ink/90 border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber to-amber-soft text-ink font-semibold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber/20 disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results List */}
      {bookings !== null && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-heading text-lg font-bold text-white">
              Found Bookings ({bookings.length})
            </h2>
            <span className="text-xs font-mono text-neutral-400">
              Query: {query}
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center space-y-4 border border-white/10 max-w-lg mx-auto">
              <Calendar className="w-10 h-10 text-neutral-500 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-white">No Matching Records Found</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                We couldn't locate any active stage bookings with that phone number or email. If you reserved directly via phone, our dispatcher will link your record shortly.
              </p>
              <div className="pt-2">
                <Link
                  href="/book"
                  className="inline-block px-6 py-2.5 rounded-full bg-amber text-ink text-xs font-semibold uppercase tracking-wider"
                >
                  Book A Stage Rig Now
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((b) => {
                const isCallDone = b.status === 'APPROVED' || b.status === 'CONFIRMED' || b.paymentStatus === 'ADVANCE_PAID';
                const isAdvancePaid = b.paymentStatus === 'ADVANCE_PAID';

                return (
                  <div
                    key={b.id}
                    className="glass-card-amber rounded-3xl p-6 sm:p-8 border border-amber/30 space-y-6 shadow-xl"
                  >
                    {/* Top Identity Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-xl font-bold text-white">
                            {b.packageName}
                          </span>
                          <span className="text-xs font-mono text-amber font-bold px-2 py-0.5 rounded bg-amber/10 border border-amber/20">
                            #{b.id.slice(0, 8)}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-400 font-mono mt-1">
                          Booked for: <strong className="text-white">{b.customerName}</strong> • {b.customerPhone}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                            isAdvancePaid
                              ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                              : isCallDone
                              ? 'bg-sky-950/80 border border-sky-500/40 text-sky-400'
                              : 'bg-amber-950/80 border border-amber-500/40 text-amber-400 animate-pulse'
                          }`}
                        >
                          {isAdvancePaid
                            ? '🎉 Date Locked'
                            : isCallDone
                            ? '📞 Call Confirmed • Pay Advance'
                            : '⏳ Awaiting Confirmation Call'}
                        </span>
                      </div>
                    </div>

                    {/* 4-STEP VISUAL PROGRESSION */}
                    <div className="bg-ink/60 rounded-2xl p-4 sm:p-5 border border-white/10">
                      <span className="text-[11px] font-mono uppercase text-amber tracking-wider block mb-4 font-semibold">
                        Live Booking Progress
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Step 1 */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>1. Request Placed</span>
                          </div>
                          <p className="text-[11px] text-neutral-400">Order logged in dispatch queue</p>
                        </div>

                        {/* Step 2 */}
                        <div className="space-y-1">
                          <div
                            className={`flex items-center gap-2 font-mono text-xs font-bold ${
                              isCallDone ? 'text-emerald-400' : 'text-amber'
                            }`}
                          >
                            {isCallDone ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Phone className="w-4 h-4 animate-pulse" />
                            )}
                            <span>2. Operations Call</span>
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            {isCallDone ? 'Venue & power verified' : 'Engineer calling your phone'}
                          </p>
                        </div>

                        {/* Step 3 */}
                        <div className="space-y-1">
                          <div
                            className={`flex items-center gap-2 font-mono text-xs font-bold ${
                              isAdvancePaid
                                ? 'text-emerald-400'
                                : isCallDone
                                ? 'text-sky-400'
                                : 'text-neutral-500'
                            }`}
                          >
                            {isAdvancePaid ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <CreditCard className="w-4 h-4" />
                            )}
                            <span>3. 25% Advance</span>
                          </div>
                          <p className="text-[11px] text-neutral-400">
                            {isAdvancePaid
                              ? `₹${(b.advanceAmount / 100).toLocaleString('en-IN')} paid • locked`
                              : isCallDone
                              ? 'Ready to pay & lock date'
                              : 'Unlocks post-call'}
                          </p>
                        </div>

                        {/* Step 4 */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-mono text-xs font-bold text-neutral-500">
                            <Clock className="w-4 h-4" />
                            <span>4. Sound-Check & Gig</span>
                          </div>
                          <p className="text-[11px] text-neutral-400">75% balance due on-site</p>
                        </div>
                      </div>
                    </div>

                    {/* Event & Logistics Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-neutral-300 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-amber" />
                          <span>Event Date: <strong className="text-white">{new Date(b.eventDate).toDateString()}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-300">
                          <MapPin className="w-3.5 h-3.5 text-amber shrink-0" />
                          <span>Venue: {b.venueAddress}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 font-mono text-right md:text-right bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="flex justify-between text-neutral-400">
                          <span>Total Rental:</span>
                          <span className="text-white font-bold">{formatINR(b.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-amber">
                          <span>25% Advance:</span>
                          <span className="font-bold">{formatINR(b.advanceAmount)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-400 text-[11px]">
                          <span>Balance on Event Day:</span>
                          <span>{formatINR(b.balanceAmount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-xs text-neutral-400 font-mono">
                        {!isCallDone ? (
                          <span>📞 Expecting call from: <strong className="text-white">+91 98765 43210</strong></span>
                        ) : isAdvancePaid ? (
                          <span className="text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Date secured in warehouse calendar</span>
                          </span>
                        ) : (
                          <span className="text-amber">Phone confirmed! Lock your date with 25% deposit:</span>
                        )}
                      </div>

                      <div>
                        {isAdvancePaid ? (
                          <Link
                            href={`/pay?bookingId=${b.id}`}
                            className="px-5 py-2.5 rounded-full glass-card border border-white/20 text-white hover:bg-white/10 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                          >
                            <span>View Official Invoice & Receipt</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : isCallDone ? (
                          <Link
                            href={`/pay?bookingId=${b.id}`}
                            className="px-6 py-3 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink hover:brightness-110 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber/25 transition-all"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Pay 25% Advance ({formatINR(b.advanceAmount)})</span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2">
                            <a
                              href="tel:+919876543210"
                              className="px-4 py-2 rounded-full glass-card border border-amber/30 text-amber hover:bg-amber/10 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call Us Directly</span>
                            </a>
                            <Link
                              href={`/pay?bookingId=${b.id}`}
                              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-mono tracking-wider"
                            >
                              View Order
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-amber font-mono text-xs">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading booking tracker...</span>
        </div>
      }
    >
      <MyBookingsContent />
    </Suspense>
  );
}

