'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  MapPin,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPackageSlug = searchParams.get('package') || 'premium-dj';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Form State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateAvailable, setDateAvailable] = useState<boolean | null>(null);
  const [checkingDate, setCheckingDate] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  const [selectedPackageSlug, setSelectedPackageSlug] = useState<string>(initialPackageSlug);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    venueAddress: '',
    eventType: 'Wedding Reception',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch packages on mount
  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPackages(data.packages);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingPackages(false));
  }, []);

  // Update selected package if URL param changes
  useEffect(() => {
    const pkg = searchParams.get('package');
    if (pkg) setSelectedPackageSlug(pkg);
  }, [searchParams]);

  // Handle Date Verification
  const verifyDate = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setDateAvailable(null);
    setDateError(null);

    if (!dateStr) return;

    setCheckingDate(true);
    try {
      const res = await fetch('/api/availability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr }),
      });
      const data = await res.json();

      if (data.available) {
        setDateAvailable(true);
      } else {
        setDateAvailable(false);
        setDateError(data.reason || 'This date is already blocked or reserved.');
      }
    } catch {
      setDateError('Failed to verify date availability. Please try again.');
    } finally {
      setCheckingDate(false);
    }
  };

  const selectedPackage = packages.find((p) => p.slug === selectedPackageSlug) || packages[0];
  const totalAmount = selectedPackage ? selectedPackage.price : 2500000;
  const advanceAmount = Math.round(totalAmount * 0.25);
  const balanceAmount = totalAmount - advanceAmount;

  // Submit Draft Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setSubmitting(true);

    try {
      const payload = {
        packageSlug: selectedPackageSlug,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        eventDate: selectedDate,
        venueAddress: formData.venueAddress,
        eventType: formData.eventType,
        notes: formData.notes,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit booking draft');
      }

      setBookingSuccess(data.booking);
    } catch (err: any) {
      setBookingError(err.message || 'Booking submission error');
    } finally {
      setSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber flex items-center justify-center mx-auto shadow-xl shadow-amber-950/50">
          <Phone className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/10 border border-amber/30 text-amber text-[11px] font-mono uppercase tracking-wider">
            <span>Step 1 of 3: Booking Request Logged</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Booking Received! Next: Confirmation Call
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto">
            Our team reviews every stage rig to verify electrical load and logistics before taking your deposit.
          </p>
        </div>

        {/* Call Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber text-ink flex items-center justify-center shrink-0 mt-0.5 font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-heading text-sm font-bold text-white">
              We will call you at <span className="text-amber font-mono">{bookingSuccess.customerPhone}</span>
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Our sound engineer will call you within 15–30 minutes to confirm venue power (single/3-phase), stage clearance, and arrival timing. Once confirmed, we will unlock your 25% advance payment to officially lock your date.
            </p>
          </div>
        </div>

        <div className="glass-card-amber rounded-3xl p-6 sm:p-8 text-left space-y-4 border border-amber/30 text-xs">
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-neutral-400 font-mono">Booking Ref ID:</span>
            <span className="font-mono text-amber font-bold">{bookingSuccess.id}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-neutral-400 font-mono">Customer:</span>
            <span className="font-medium text-white">{bookingSuccess.customerName}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-neutral-400 font-mono">Event Date:</span>
            <span className="font-mono text-white">{bookingSuccess.eventDate}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-neutral-400 font-mono">Selected Rig:</span>
            <span className="font-medium text-amber">{bookingSuccess.packageName}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-3">
            <span className="text-neutral-400 font-mono">Total Rental Amount:</span>
            <span className="font-mono text-white font-bold">{formatINR(bookingSuccess.totalAmount)}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-3 text-sm">
            <span className="text-amber font-mono font-bold">25% Advance Required to Lock:</span>
            <span className="font-mono text-amber font-extrabold">{formatINR(bookingSuccess.advanceAmount)}</span>
          </div>
          <div className="flex justify-between text-neutral-400 text-[11px]">
            <span>Balance Due On-Site Post Sound-Check (75%):</span>
            <span className="font-mono text-neutral-200">{formatINR(bookingSuccess.balanceAmount)}</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href={`/my-bookings?query=${encodeURIComponent(bookingSuccess.customerPhone)}`}
            className="w-full py-4 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 shadow-xl shadow-amber/25 transition-all"
          >
            <span>Track Order in Customer Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '919876543210'}?text=${encodeURIComponent(
              `Hi Eswari Sound System, I just placed booking request #${bookingSuccess.id.slice(0, 8)} for ${bookingSuccess.packageName} on ${bookingSuccess.eventDate}. Please confirm my event details.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-full glass-card hover:bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <span>💬 Chat on WhatsApp with Dispatch</span>
          </a>

          <Link
            href="/"
            className="block text-xs font-mono text-neutral-400 hover:text-white pt-2"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Calculate today and max date (1 year out)
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <span className="text-amber text-xs font-mono uppercase tracking-widest font-semibold">
          Instant Production Booking
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          Reserve Your Concert Rig & Stage Crew
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300">
          3-step reservation with real-time calendar verification and 25% advance lock.
        </p>

        {/* Stepper Indicator */}
        <div className="flex items-center justify-center gap-3 pt-4">
          {[
            { num: 1, label: 'Date Check' },
            { num: 2, label: 'Select Package' },
            { num: 3, label: 'Venue Details' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (s.num < step || (s.num === 2 && dateAvailable) || (s.num === 3 && dateAvailable)) {
                    setStep(s.num as any);
                  }
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  step === s.num
                    ? 'bg-amber text-ink shadow-md shadow-amber/20'
                    : step > s.num
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/10 text-neutral-400'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </button>
              <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
                {s.label}
              </span>
              {s.num < 3 && <span className="text-neutral-600 hidden sm:inline">—</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Step Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: DATE VERIFICATION */}
          {step === 1 && (
            <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber/15 border border-amber/30 flex items-center justify-center text-amber">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-white">
                    Step 1: Check Event Date Availability
                  </h2>
                  <p className="text-xs text-neutral-400">
                    We only power one major arena or multi-stage event per date to ensure 100% focus.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300">
                  Select Desired Event Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={today}
                    max={maxDateStr}
                    value={selectedDate}
                    onChange={(e) => verifyDate(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-ink/90 border border-white/15 text-white text-sm focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber font-mono"
                  />
                </div>

                {checkingDate && (
                  <div className="flex items-center gap-2 text-xs text-amber font-mono py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying depot availability and blackout registry...</span>
                  </div>
                )}

                {dateAvailable === true && (
                  <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold block">Date is 100% Available!</span>
                        Depot fleet and lead FOH crew are open on this date.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-ink font-semibold text-xs uppercase tracking-wider hover:brightness-110 shrink-0 ml-3"
                    >
                      Proceed
                    </button>
                  </div>
                )}

                {dateAvailable === false && (
                  <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Date Unavailable</span>
                      {dateError || 'This date is already reserved. Please pick another date or inquire for custom multi-rig deployment.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PACKAGE SELECTION */}
          {step === 2 && (
            <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber/15 border border-amber/30 flex items-center justify-center text-amber">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-white">
                      Step 2: Choose Your Stage Rig
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Configured for selected date: <span className="text-amber font-mono">{selectedDate}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-mono text-neutral-400 hover:text-white"
                >
                  Change Date
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {packages.map((pkg) => {
                  const isSelected = selectedPackageSlug === pkg.slug;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageSlug(pkg.slug)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'glass-card-amber border-amber shadow-lg shadow-amber/15'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-amber bg-amber' : 'border-neutral-500'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-ink" />}
                          </span>
                          <span className="font-heading text-base font-bold text-white">
                            {pkg.name}
                          </span>
                        </div>
                        <span className="font-heading text-base font-bold text-amber">
                          {formatINR(pkg.price)}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-400 pl-6 leading-relaxed mb-3">
                        {pkg.description}
                      </p>

                      <div className="pl-6 text-[11px] text-neutral-400 font-mono flex items-center gap-4">
                        <span>Advance: <strong className="text-white">{formatINR(pkg.price * 0.25)}</strong></span>
                        <span>•</span>
                        <span>Balance: <strong className="text-neutral-300">{formatINR(pkg.price * 0.75)}</strong></span>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Date</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink font-semibold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-2 shadow-lg shadow-amber/20"
                  >
                    <span>Proceed To Venue Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CLIENT & VENUE DETAILS */}
          {step === 3 && (
            <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber/15 border border-amber/30 flex items-center justify-center text-amber">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-white">
                      Step 3: Client & Venue Details
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Enter contact info for dispatch team and invoice generation.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-mono text-neutral-400 hover:text-white"
                >
                  Change Rig
                </button>
              </div>

              {bookingError && (
                <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Full Name / Organization Head
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Senthil Nathan"
                    className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1">
                      10-Digit Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1">
                      Email Address (For Invoices)
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="senthil@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Event Type
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                  >
                    <option value="Wedding Reception">Wedding Reception / Muhurtham</option>
                    <option value="Concert / Live Music">Concert / Live Music Performance</option>
                    <option value="College Cultural Fest">College Cultural Fest / Annual Day</option>
                    <option value="Corporate Summit">Corporate Summit / Product Launch</option>
                    <option value="Temple Festival">Temple Festival / Outdoor Devotional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Full Venue Address & Landmark
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    placeholder="Mandapam / Hall name, street, locality, city (e.g. Chennai, Madurai)..."
                    className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Special Rigging or Acoustic Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Stage power supply available, sound check by 4 PM..."
                    className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                  />
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Packages</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-amber to-amber-soft text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-amber/25 disabled:opacity-60 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registering Booking...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit & Confirm 25% Advance</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Live Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="glass-card-amber rounded-3xl p-6 sm:p-8 border border-amber/30 space-y-5">
            <h3 className="font-heading text-lg font-bold text-white flex items-center justify-between">
              <span>Production Order Summary</span>
              <span className="text-[10px] font-mono uppercase text-amber">Single Provider</span>
            </h3>

            <div className="space-y-3.5 text-xs border-y border-white/10 py-4">
              <div className="flex justify-between">
                <span className="text-neutral-400 font-mono">Date:</span>
                <span className="text-white font-mono font-medium">
                  {selectedDate ? new Date(selectedDate).toDateString() : 'Not Selected'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400 font-mono">Rig Setup:</span>
                <span className="text-white font-medium text-right max-w-[180px]">
                  {selectedPackage?.name || 'Premium DJ Package'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-400 font-mono">Day Rate:</span>
                <span className="text-white font-mono">{formatINR(totalAmount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-amber">Advance Due Now (25%):</span>
                <span className="font-mono font-extrabold text-amber">{formatINR(advanceAmount)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Balance On-Site (75%):</span>
                <span className="font-mono text-neutral-200">{formatINR(balanceAmount)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2 text-[11px] text-neutral-400 font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Brokerage Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber" />
                <span>Sound Check Included (3 Hrs Prior)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-amber font-mono text-xs">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <BookingFlow />
    </Suspense>
  );
}
