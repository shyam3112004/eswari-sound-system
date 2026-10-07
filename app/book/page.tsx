'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
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
        <div className="space-y-2">
          <span className="label label-amber">Booking request logged</span>
          <h1 className="font-heading text-h1 text-white mt-3">
            Received. Next: the confirmation call.
          </h1>
          <p className="text-body text-fg-muted max-w-measure mx-auto leading-relaxed">
            Every rig is checked for electrical load and access before we take a
            deposit. That check is what the next call is about.
          </p>
        </div>

        {/* Call note */}
        <div className="text-left border-l-2 border-amber pl-5 py-4">
          <p className="font-heading text-base font-bold text-white">
            We call you at{' '}
            <span className="text-amber font-mono">{bookingSuccess.customerPhone}</span>
          </p>
          <p className="mt-2 text-small text-fg-muted leading-relaxed max-w-measure">
            Within 15–30 minutes we confirm venue power (single or 3-phase),
            stage clearance and arrival timing. Once that is settled you unlock
            the 25% advance and the date is locked on the calendar.
          </p>
        </div>

        <div className="text-left">
          <div className="hairline flex justify-between gap-4 py-3 text-small">
            <span className="label">Booking ref</span>
            <span className="font-mono text-amber font-bold">{bookingSuccess.id}</span>
          </div>
          <div className="hairline flex justify-between gap-4 py-3 text-small">
            <span className="label">Customer</span>
            <span className="font-medium text-white">{bookingSuccess.customerName}</span>
          </div>
          <div className="hairline flex justify-between gap-4 py-3 text-small">
            <span className="label">Event date</span>
            <span className="font-mono text-white">{bookingSuccess.eventDate}</span>
          </div>
          <div className="hairline flex justify-between gap-4 py-3 text-small">
            <span className="label">Stage rig</span>
            <span className="font-medium text-amber">{bookingSuccess.packageName}</span>
          </div>
          <div className="hairline flex justify-between gap-4 py-3 text-small">
            <span className="label">Total day rate</span>
            <span className="font-mono text-white font-bold">{formatINR(bookingSuccess.totalAmount)}</span>
          </div>
          <div className="hairline flex justify-between gap-4 py-3 text-small">
            <span className="label label-amber">25% advance to lock</span>
            <span className="font-mono text-amber font-extrabold">{formatINR(bookingSuccess.advanceAmount)}</span>
          </div>
          <div className="hairline flex justify-between gap-4 py-3 text-small">
            <span className="label">Balance on site after sound-check</span>
            <span className="font-mono text-fg-soft">{formatINR(bookingSuccess.balanceAmount)}</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href={`/my-bookings?query=${encodeURIComponent(bookingSuccess.customerPhone)}`}
            className="btn-primary w-full"
          >
            <span>Track Order in Customer Portal</span>
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>

          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '919876543210'}?text=${encodeURIComponent(
              `Hi Eswari Sound System, I just placed booking request #${bookingSuccess.id.slice(0, 8)} for ${bookingSuccess.packageName} on ${bookingSuccess.eventDate}. Please confirm my event details.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link-arrow flex w-max mx-auto"
          >
            <span>Chat on WhatsApp with Dispatch</span>
          </a>

          <Link
            href="/"
            className="link-arrow flex w-max mx-auto !text-fg-muted"
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
      <div className="max-w-3xl">
        <span className="label label-amber">Instant production booking</span>
        <h1 className="font-heading text-h1 text-white mt-3">
          Reserve the rig and the crew
        </h1>
        <p className="mt-4 text-body text-fg-muted leading-relaxed max-w-measure">
          Four short steps: date, rig, extras, venue. The calendar is checked
          live, and 25% advance locks the date the moment you pay.
        </p>

        {/* Stepper — text tabs with an amber underline */}
        <div className="mt-8 flex items-start gap-6 overflow-x-auto border-b border-white/[0.12] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { num: 1, label: 'Date Check' },
            { num: 2, label: 'Select Package' },
            { num: 3, label: 'Materials' },
            { num: 4, label: 'Venue Details' },
          ].map((s) => (
            <div key={s.num} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (s.num < step || (s.num === 2 && dateAvailable) || (s.num === 3 && dateAvailable) || (s.num === 4 && dateAvailable)) {
                    setStep(s.num as any);
                  }
                }}
                className={`tab ${step === s.num ? 'is-active' : ''} ${
                  step > s.num ? '!text-fg-soft' : ''
                }`}
              >
                <span className={step === s.num ? 'text-amber' : ''}>
                  {String(s.num).padStart(2, '0')}
                </span>
                <span className="ml-2">{s.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-12">
        {/* Main Step Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: DATE VERIFICATION */}
          {step === 1 && (
            <div className="hairline pt-6 pb-8 space-y-6">
              <div>
                <span className="label label-amber">Step 01</span>
                <h2 className="font-heading text-h3 text-white mt-2">
                  Check the event date
                </h2>
                <p className="mt-2 text-small text-fg-muted leading-relaxed max-w-measure">
                  One major arena or multi-stage event per date. That is the
                  entire schedule policy.
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="field-label" htmlFor="event-date">
                    Select event date
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    min={today}
                    max={maxDateStr}
                    value={selectedDate}
                    onChange={(e) => verifyDate(e.target.value)}
                    className="field font-mono"
                  />
                </div>

                {checkingDate && (
                  <div className="flex items-center gap-2 text-spec text-amber font-mono py-2">
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    <span>Verifying depot availability and blackout registry...</span>
                  </div>
                )}

                {dateAvailable === true && (
                  <div className="alert alert-success flex flex-wrap items-center justify-between gap-4">
                    <span className="text-emerald-300">
                      <strong className="block font-semibold">Date is open</strong>
                      Depot fleet and the lead FOH crew are free on this date.
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-primary btn-primary-sm shrink-0"
                    >
                      Proceed
                    </button>
                  </div>
                )}

                {dateAvailable === false && (
                  <div className="alert alert-error" role="alert">
                    <strong className="block font-semibold text-red-200">
                      Date unavailable
                    </strong>
                    {dateError ||
                      'This date is already reserved. Pick another date, or send an inquiry for a multi-rig deployment.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PACKAGE SELECTION */}
          {step === 2 && (
            <div className="hairline pt-6 pb-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="label label-amber">Step 02</span>
                  <h2 className="font-heading text-h3 text-white mt-2">
                    Choose the stage rig
                  </h2>
                  <p className="mt-2 text-small text-fg-muted font-mono">
                    Configured for {selectedDate}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="link-arrow !text-fg-muted shrink-0"
                >
                  <span>Change date</span>
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {packages.map((pkg) => {
                  const isSelected = selectedPackageSlug === pkg.slug;
                  const isPkgCustom = pkg.slug === 'custom-rig';

                  return (
                    <div
                      key={pkg.id}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => setSelectedPackageSlug(pkg.slug)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedPackageSlug(pkg.slug);
                        }
                      }}
                      className={`hairline py-5 pl-4 -ml-4 border-l-2 cursor-pointer transition-colors focus:outline-none focus-visible:border-l-amber ${
                        isSelected
                          ? 'border-l-amber'
                          : 'border-l-transparent hover:border-l-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span className="font-heading text-h4 text-white flex items-center gap-2">
                            <span>{pkg.name}</span>
                            {isPkgCustom && (
                              <span className="label label-amber">Build your own</span>
                            )}
                          </span>
                        </div>
                        <span
                          className={`font-heading text-lg font-bold ${
                            isSelected ? 'text-amber' : 'text-fg-soft'
                          }`}
                        >
                          {isPkgCustom ? 'Dynamic (₹0 Base)' : formatINR(pkg.price)}
                        </span>
                      </div>

                      <p className="text-small text-fg-muted leading-relaxed max-w-measure mb-3">
                        {pkg.description}
                      </p>

                      <div className="text-spec text-fg-muted font-mono flex flex-wrap items-center gap-x-4 gap-y-1">
                        {isPkgCustom ? (
                          <>
                            <span>Advance: <strong className="text-white">25% of materials total</strong></span>
                            <span>•</span>
                            <span>Balance: <strong className="text-fg-soft">75% on site</strong></span>
                          </>
                        ) : (
                          <>
                            <span>Advance: <strong className="text-white">{formatINR(pkg.price * 0.25)}</strong></span>
                            <span>•</span>
                            <span>Balance: <strong className="text-fg-soft">{formatINR(pkg.price * 0.75)}</strong></span>
                          </>
                        )}
                      </div>

                      {isSelected && isPkgCustom && (
                        <div className="mt-3 alert">
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
                    className="link-arrow !text-fg-muted"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
                    <span>Back to date</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-primary"
                  >
                    <span>{isCustomRig ? 'Choose Custom Materials' : 'Continue to Materials'}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden />
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
            <div className="hairline pt-6 pb-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="label label-amber">Step 04</span>
                  <h2 className="font-heading text-h3 text-white mt-2">
                    Client &amp; venue details
                  </h2>
                  <p className="mt-2 text-small text-fg-muted max-w-measure">
                    What dispatch and the invoice need before we load the truck.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="link-arrow !text-fg-muted shrink-0"
                >
                  <span>Change materials</span>
                </button>
              </div>

              {bookingError && (
                <div className="alert alert-error text-red-200" role="alert">
                  {bookingError}
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-7">
                <div>
                  <label className="field-label" htmlFor="bk-name">
                    Full Name / Organization Head
                  </label>
                  <input
                    id="bk-name"
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Senthil Nathan"
                    className="field"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                  <div>
                    <label className="field-label" htmlFor="bk-phone">
                      10-Digit Mobile Number
                    </label>
                    <input
                      id="bk-phone"
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="9876543210"
                      className="field font-mono"
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="bk-email">
                      Email Address (For Invoices)
                    </label>
                    <input
                      id="bk-email"
                      type="email"
                      required
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="senthil@example.com"
                      className="field"
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label" htmlFor="bk-type">
                    Event Type
                  </label>
                  <select
                    id="bk-type"
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="field bg-ink"
                  >
                    <option value="Wedding Reception">Wedding Reception / Muhurtham</option>
                    <option value="Concert / Live Music">Concert / Live Music Performance</option>
                    <option value="College Cultural Fest">College Cultural Fest / Annual Day</option>
                    <option value="Corporate Summit">Corporate Summit / Product Launch</option>
                    <option value="Temple Festival">Temple Festival / Outdoor Devotional</option>
                  </select>
                </div>

                <div>
                  <label className="field-label" htmlFor="bk-venue">
                    Full Venue Address & Landmark
                  </label>
                  <textarea
                    id="bk-venue"
                    rows={2}
                    required
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    placeholder="Mandapam / Hall name, street, locality, city (e.g. Chennai, Madurai)..."
                    className="field resize-none"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="bk-notes">
                    Special Rigging or Acoustic Notes (Optional)
                  </label>
                  <input
                    id="bk-notes"
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Stage power supply available, sound check by 4 PM..."
                    className="field"
                  />
                </div>

                <div className="hairline pt-6 flex flex-wrap justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="link-arrow !text-fg-muted"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
                    <span>Back to Materials</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                        <span>Registering Booking...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit & Confirm 25% Advance</span>
                        <ArrowRight className="w-4 h-4" aria-hidden />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Live order summary — sticky column behind a vertical hairline */}
        <aside className="lg:border-l lg:border-white/10 lg:pl-8">
          <div className="lg:sticky lg:top-28">
            <div className="hairline pt-4 flex items-baseline justify-between gap-3">
              <h3 className="font-heading text-h4 text-white">Production order</h3>
              <span className="label label-amber !text-[9px]">Single provider</span>
            </div>

            <div className="text-small">
              <div className="hairline flex justify-between gap-4 py-3">
                <span className="label">Date</span>
                <span className="text-fg-soft font-mono text-right">
                  {selectedDate ? new Date(selectedDate).toDateString() : 'Not Selected'}
                </span>
              </div>

              <div className="hairline flex justify-between gap-4 py-3">
                <span className="label shrink-0">Rig setup</span>
                <span className="text-fg-soft text-right">
                  {selectedPackage?.name || 'Premium DJ Package'}
                </span>
              </div>

              <div className="hairline flex justify-between gap-4 py-3">
                <span className="label">Package rate</span>
                <span className="text-fg-soft font-mono tabular-nums">
                  {isCustomRig ? '₹0 (Custom Rig Base)' : formatINR(packageAmount)}
                </span>
              </div>

              {selectedMaterials.length > 0 ? (
                <>
                  <div className="hairline flex justify-between gap-4 py-3">
                    <span className="label">Materials ({selectedMaterials.length})</span>
                    <span className="text-fg-soft font-mono tabular-nums">
                      {formatINR(materialsAmount)}
                    </span>
                  </div>
                  <div className="pl-4 max-h-36 overflow-y-auto">
                    {selectedMaterials.map((sm) => (
                      <div
                        key={sm.material.id}
                        className="flex justify-between gap-3 py-1 text-spec text-fg-muted"
                      >
                        <span>{sm.material.name} × {sm.quantity}</span>
                        <span className="font-mono">{formatINR(sm.material.pricePerDay * sm.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : isCustomRig ? (
                <div className="hairline py-3 text-spec text-amber font-mono">
                  <span>No materials chosen yet. Please pick gear in Step 3.</span>
                </div>
              ) : null}

              <div className="hairline flex justify-between items-baseline gap-4 py-4">
                <span className="label">Total day rate</span>
                <span className="font-heading text-2xl font-black text-fg tabular-nums">
                  {formatINR(totalAmount)}
                </span>
              </div>
            </div>

            <div className="hairline pt-4 space-y-2">
              <div className="flex justify-between items-baseline gap-4">
                <span className="label label-amber">Advance due now (25%)</span>
                <span className="font-mono font-bold text-amber tabular-nums">
                  {formatINR(advanceAmount)}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-4">
                <span className="label">Balance on site (75%)</span>
                <span className="font-mono text-fg-soft tabular-nums">
                  {formatINR(balanceAmount)}
                </span>
              </div>
            </div>

            <div className="hairline mt-5 pt-4 space-y-2 label !tracking-[0.1em]">
              <p>Zero brokerage · crew is on our payroll</p>
              <p>Sound-check included, 3 hours before doors</p>
            </div>
          </div>
        </aside>
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
