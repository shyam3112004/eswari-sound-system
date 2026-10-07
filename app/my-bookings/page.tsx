'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Calendar,
  CheckCircle2,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CreditCard,
  Clock,
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
      const res = await fetch(
        `/api/my-bookings?query=${encodeURIComponent(searchTerm.trim())}`
      );
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
    } else {
      fetch('/api/auth/user')
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated && data.user?.email) {
            setQuery(data.user.email);
            performSearch(data.user.email);
          }
        })
        .catch(() => {});
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* Header + lookup field */}
      <div className="container-page pt-24 lg:pt-32 pb-10 max-w-4xl">
        <span className="label label-amber">Customer order tracker</span>
        <h1 className="font-heading text-h1 text-white mt-4">
          Track your booking
        </h1>
        <p className="mt-5 text-body text-fg-muted leading-relaxed max-w-measure">
          Enter the mobile number or email used at booking to see your
          confirmation call status, advance receipts and what happens on show
          day.
        </p>

        <form onSubmit={handleSearch} className="mt-10 flex flex-col sm:flex-row gap-5 sm:items-end">
          <div className="flex-1">
            <label className="field-label" htmlFor="lookup">
              Mobile number or email
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-fg-muted absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden
              />
              <input
                id="lookup"
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="9876543210 or name@example.com"
                className="field pl-7 font-mono"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary shrink-0">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            ) : (
              <>
                <span>Look up</span>
                <ArrowRight className="w-4 h-4" aria-hidden />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="alert alert-error mt-6" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Results — open records on hairlines */}
      {bookings !== null && (
        <div className="border-t border-white/[0.12]">
          <div className="container-page pt-8 pb-24 max-w-4xl">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/[0.12] pb-4">
              <h2 className="font-heading text-h4 text-white">
                Found bookings ({bookings.length})
              </h2>
              <span className="label">Query · {query}</span>
            </div>

            {bookings.length === 0 ? (
              <div className="pt-8 max-w-measure">
                <span className="label label-amber">No match</span>
                <h3 className="font-heading text-h3 text-white mt-3">
                  No records under that number
                </h3>
                <p className="mt-3 text-small text-fg-muted leading-relaxed">
                  We could not find an active stage booking for that phone
                  number or email. If you reserved by phone, the dispatcher
                  will link your record shortly — or check with the depot
                  line.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-6">
                  <Link href="/book" className="btn-primary">
                    Book a stage rig
                  </Link>
                  <a href="tel:+919876543210" className="link-arrow">
                    <span>Call the depot</span>
                  </a>
                </div>
              </div>
            ) : (
              <div>
                {bookings.map((b) => {
                  const isCallDone =
                    b.status === 'APPROVED' ||
                    b.status === 'CONFIRMED' ||
                    b.paymentStatus === 'ADVANCE_PAID';
                  const isAdvancePaid = b.paymentStatus === 'ADVANCE_PAID';

                  const STEPS = [
                    {
                      num: '01',
                      title: 'Request placed',
                      note: 'Order logged in the dispatch queue',
                      state: 'done',
                    },
                    {
                      num: '02',
                      title: 'Operations call',
                      note: isCallDone
                        ? 'Venue and power verified'
                        : 'Engineer calling your phone',
                      state: isCallDone ? 'done' : 'active',
                    },
                    {
                      num: '03',
                      title: '25% advance',
                      note: isAdvancePaid
                        ? 'Paid · date locked'
                        : isCallDone
                        ? 'Ready to pay and lock'
                        : 'Unlocks after the call',
                      state: isAdvancePaid ? 'done' : isCallDone ? 'active' : 'idle',
                    },
                    {
                      num: '04',
                      title: 'Sound-check & gig',
                      note: '75% balance due on site',
                      state: 'idle',
                    },
                  ];

                  return (
                    <article key={b.id} className="border-b border-white/[0.12] py-9">
                      {/* Identity row */}
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
                            <h3 className="font-heading text-h3 text-white">
                              {b.packageName}
                            </h3>
                            <span className="label">#{b.id.slice(0, 8)}</span>
                          </div>
                          <p className="mt-1.5 text-small text-fg-muted font-mono">
                            {b.customerName} · {b.customerPhone}
                          </p>
                        </div>
                        <span
                          className={`label shrink-0 ${
                            isAdvancePaid
                              ? 'label-amber'
                              : isCallDone
                              ? 'text-fg-soft'
                              : 'text-amber animate-pulse'
                          }`}
                        >
                          {isAdvancePaid
                            ? 'Date locked'
                            : isCallDone
                            ? 'Call confirmed · advance due'
                            : 'Awaiting confirmation call'}
                        </span>
                      </div>

                      {/* Four-step progress — numerals on hairlines */}
                      <div className="mt-7">
                        <span className="label">Live booking progress</span>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
                          {STEPS.map((s) => (
                            <div
                              key={s.num}
                              className={`border-t py-4 ${
                                s.state === 'done'
                                  ? 'border-amber/60'
                                  : s.state === 'active'
                                  ? 'border-amber/30'
                                  : 'border-white/[0.12]'
                              }`}
                            >
                              <div
                                className={`flex items-center gap-2 text-spec font-mono font-bold ${
                                  s.state === 'done'
                                    ? 'text-amber'
                                    : s.state === 'active'
                                    ? 'text-fg'
                                    : 'text-fg-muted'
                                }`}
                              >
                                {s.state === 'done' ? (
                                  <CheckCircle2 className="w-4 h-4" aria-hidden />
                                ) : s.state === 'active' ? (
                                  s.num === '02' ? (
                                    <Phone className="w-4 h-4 animate-pulse" aria-hidden />
                                  ) : (
                                    <CreditCard className="w-4 h-4" aria-hidden />
                                  )
                                ) : (
                                  <Clock className="w-4 h-4" aria-hidden />
                                )}
                                <span>
                                  {s.num} · {s.title}
                                </span>
                              </div>
                              <p className="mt-1.5 text-small text-fg-muted">
                                {s.note}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Logistics + money on hairlines */}
                      <div className="mt-7 grid grid-cols-1 lg:grid-cols-2 gap-x-14">
                        <div className="text-small">
                          <div className="border-t border-white/[0.12] py-3.5 flex items-start justify-between gap-4">
                            <span className="label flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" aria-hidden />
                              Event date
                            </span>
                            <span className="font-mono text-white text-right">
                              {new Date(b.eventDate).toDateString()}
                            </span>
                          </div>
                          <div className="border-t border-white/[0.12] py-3.5 flex items-start justify-between gap-4">
                            <span className="label flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
                              Venue
                            </span>
                            <span className="text-fg-soft text-right max-w-[62%]">
                              {b.venueAddress}
                            </span>
                          </div>
                        </div>

                        <div className="text-small mt-6 lg:mt-0">
                          <div className="border-t border-white/[0.12] py-3.5 flex justify-between gap-4">
                            <span className="label">Total rental</span>
                            <span className="font-mono text-white font-bold tabular-nums">
                              {formatINR(b.totalAmount)}
                            </span>
                          </div>
                          <div className="border-t border-white/[0.12] py-3.5 flex justify-between gap-4">
                            <span className="label label-amber">25% advance</span>
                            <span className="font-mono text-amber font-bold tabular-nums">
                              {formatINR(b.advanceAmount)}
                            </span>
                          </div>
                          <div className="border-t border-white/[0.12] py-3.5 flex justify-between gap-4">
                            <span className="label">Balance on event day</span>
                            <span className="font-mono text-fg-soft tabular-nums">
                              {formatINR(b.balanceAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Included materials */}
                      {b.bookingMaterials && b.bookingMaterials.length > 0 && (
                        <div className="mt-7 border-t border-white/[0.12] pt-5">
                          <span className="label">
                            Rental equipment ({b.bookingMaterials.length})
                          </span>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-10 text-spec font-mono">
                            {b.bookingMaterials.map((bm: any) => (
                              <div
                                key={bm.id}
                                className="flex justify-between gap-4 py-1.5 border-b border-white/[0.07]"
                              >
                                <span className="text-fg-muted">
                                  {bm.material?.name || 'Equipment'} × {bm.quantity}
                                </span>
                                <span className="text-amber tabular-nums">
                                  {formatINR(
                                    bm.totalPrice || bm.pricePerDay * bm.quantity
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action row */}
                      <div className="mt-7 border-t border-white/[0.12] pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div className="label max-w-[46ch]">
                          {!isCallDone ? (
                            <span>
                              Expecting the operations call from{' '}
                              <span className="text-fg-soft">+91 98765 43210</span>
                            </span>
                          ) : isAdvancePaid ? (
                            <span className="label-amber flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
                              <span>Date secured in the warehouse calendar</span>
                            </span>
                          ) : (
                            <span>
                              Call done. Lock the date with the 25% deposit.
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-6 shrink-0">
                          {isAdvancePaid ? (
                            <Link href={`/pay?bookingId=${b.id}`} className="link-arrow">
                              <span>View invoice &amp; receipt</span>
                              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                            </Link>
                          ) : isCallDone ? (
                            <Link href={`/pay?bookingId=${b.id}`} className="btn-primary">
                              <CreditCard className="w-4 h-4" aria-hidden />
                              <span>Pay {formatINR(b.advanceAmount)} advance</span>
                            </Link>
                          ) : (
                            <>
                              <a href="tel:+919876543210" className="link-arrow label-amber">
                                <Phone className="w-3.5 h-3.5" aria-hidden />
                                <span>Call us directly</span>
                              </a>
                              <Link href={`/pay?bookingId=${b.id}`} className="link-arrow">
                                <span>View order</span>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center gap-2 text-amber font-mono text-xs">
          <Loader2 className="w-6 h-6 animate-spin" aria-hidden />
          <span>Loading booking tracker…</span>
        </div>
      }
    >
      <MyBookingsContent />
    </Suspense>
  );
}
