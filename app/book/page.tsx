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
import MaterialsSelection from '@/components/ui/MaterialsSelection';

function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPackageSlug = searchParams.get('package') || 'premium-dj';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
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

  // Materials selection state
  const [selectedMaterials, setSelectedMaterials] = useState<Array<{
    material: any;
    quantity: number;
  }>>([]);

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

    fetch('/api/auth/user')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setFormData((prev) => ({
            ...prev,
            customerName: prev.customerName || data.user.name || '',
            customerEmail: prev.customerEmail || data.user.email || '',
          }));
        }
      })
      .catch(() => {});

    // Load pre-selected materials from sessionStorage (from catalog "Book as Custom Package")
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('customPackageMaterials');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedMaterials(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to parse customPackageMaterials:', e);
      }
    }
  }, []);

  // Update selected package if URL param changes or if materials were pre-selected
  useEffect(() => {
    const pkg = searchParams.get('package');
    if (pkg) {
      setSelectedPackageSlug(pkg);
    } else if (typeof window !== 'undefined' && sessionStorage.getItem('customPackageMaterials')) {
      setSelectedPackageSlug('custom-rig');
    }
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

  const isCustomRig = selectedPackageSlug === 'custom-rig';
  const selectedPackage = packages.find((p) => p.slug === selectedPackageSlug) || (isCustomRig ? {
    id: 'custom-rig',
    slug: 'custom-rig',
    name: 'Custom Rig (Choose Materials)',
    price: 0,
    description: 'Custom setup configured from selected rental materials. Total price is calculated dynamically.',
  } : packages[0]);

  const packageAmount = isCustomRig ? 0 : (selectedPackage ? selectedPackage.price : 2500000);
  const materialsAmount = selectedMaterials.reduce((total, sm) => total + (sm.material.pricePerDay * sm.quantity), 0);
  const totalAmount = packageAmount + materialsAmount;
  const advanceAmount = Math.round(totalAmount * 0.25);
  const balanceAmount = totalAmount - advanceAmount;

  // Submit Draft Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (isCustomRig && selectedMaterials.length === 0) {
      setBookingError('Please select at least 1 material in Step 3 to configure your custom package.');
      setStep(3);
      return;
    }

    if (totalAmount <= 0) {
      setBookingError('Total booking amount cannot be ₹0. Please choose rental materials.');
      return;
    }

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
        materials: selectedMaterials.map(sm => ({
          materialId: sm.material.id,
          quantity: sm.quantity,
        })),
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

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('customPackageMaterials');
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
            className="w-full py-4 rounded-full bg-amber text-ink font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all"
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
            <span>Chat on WhatsApp with Dispatch</span>
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
            { num: 3, label: 'Materials' },
            { num: 4, label: 'Venue Details' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (s.num < step || (s.num === 2 && dateAvailable) || (s.num === 3 && dateAvailable) || (s.num === 4 && dateAvailable)) {
                    setStep(s.num as any);
                  }
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  step === s.num
                    ? 'bg-amber text-ink '
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
              {s.num < 4 && <span className="text-neutral-600 hidden sm:inline">·</span>}
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
                  const isPkgCustom = pkg.slug === 'custom-rig';

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageSlug(pkg.slug)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? isPkgCustom
                            ? 'glass-card-amber border-haze shadow-lg shadow-haze/15'
                            : 'glass-card-amber border-amber '
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? isPkgCustom
                                  ? 'border-haze bg-haze'
                                  : 'border-amber bg-amber'
                                : 'border-neutral-500'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-ink" />}
                          </span>
                          <span className="font-heading text-base font-bold text-white flex items-center gap-2">
                            <span>{pkg.name}</span>
                            {isPkgCustom && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-haze/20 border border-haze/40 text-haze font-bold">
                                Build Your Own
                              </span>
                            )}
                          </span>
                        </div>
                        <span className={`font-heading text-base font-bold ${isPkgCustom ? 'text-haze' : 'text-amber'}`}>
                          {isPkgCustom ? 'Dynamic (₹0 Base)' : formatINR(pkg.price)}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-400 pl-6 leading-relaxed mb-3">
                        {pkg.description}
                      </p>

                      <div className="pl-6 text-[11px] text-neutral-400 font-mono flex items-center gap-4">
                        {isPkgCustom ? (
                          <>
                            <span>Advance: <strong className="text-haze">25% of Materials Total</strong></span>
                            <span>•</span>
                            <span>Balance: <strong className="text-neutral-300">75% on-site</strong></span>
                          </>
                        ) : (
                          <>
                            <span>Advance: <strong className="text-white">{formatINR(pkg.price * 0.25)}</strong></span>
                            <span>•</span>
                            <span>Balance: <strong className="text-neutral-300">{formatINR(pkg.price * 0.75)}</strong></span>
                          </>
                        )}
                      </div>

                      {isSelected && isPkgCustom && (
                        <div className="mt-3 ml-6 p-2.5 rounded-xl bg-haze/10 border border-haze/30 text-xs text-haze font-mono flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          <span>Custom Rig selected. In the next step, select the exact equipment and quantities needed.</span>
                        </div>
                      )}
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
                    className="px-6 py-3 rounded-full bg-amber text-ink font-semibold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-2 "
                  >
                    <span>{isCustomRig ? 'Choose Custom Materials' : 'Continue to Materials'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MATERIALS SELECTION */}
          {step === 3 && (
            <MaterialsSelection
              selectedMaterials={selectedMaterials}
              onMaterialsChange={setSelectedMaterials}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
              isCustomPackage={isCustomRig}
            />
          )}

          {/* STEP 4: CLIENT & VENUE DETAILS */}
          {step === 4 && (
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
                  onClick={() => setStep(3)}
                  className="text-xs font-mono text-neutral-400 hover:text-white"
                >
                  Change Materials
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
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Materials</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-4 rounded-full bg-amber text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2"
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
                <span className="text-neutral-400 font-mono">Package Rate:</span>
                <span className="text-white font-mono">
                  {isCustomRig ? '₹0 (Custom Rig Base)' : formatINR(packageAmount)}
                </span>
              </div>

              {selectedMaterials.length > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-neutral-400 font-mono">Materials ({selectedMaterials.length}):</span>
                    <span className="text-haze font-mono">{formatINR(materialsAmount)}</span>
                  </div>
                  <div className="pl-4 space-y-1 text-[11px] max-h-36 overflow-y-auto">
                    {selectedMaterials.map((sm) => (
                      <div key={sm.material.id} className="flex justify-between text-neutral-400">
                        <span>{sm.material.name} × {sm.quantity}</span>
                        <span className="text-neutral-300 font-mono">{formatINR(sm.material.pricePerDay * sm.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : isCustomRig ? (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber text-[11px] font-mono flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden />
                  <span>No materials chosen yet. Please pick gear in Step 3.</span>
                </div>
              ) : null}

              <div className="flex justify-between pt-2 border-t border-white/5">
                <span className="text-neutral-400 font-mono font-bold">Total Day Rate:</span>
                <span className="text-white font-mono font-bold">{formatINR(totalAmount)}</span>
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
