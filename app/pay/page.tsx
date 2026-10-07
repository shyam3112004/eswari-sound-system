'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Loader2,
  Printer,
  CreditCard,
  Phone,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function PaymentScreen() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided in URL');
      setLoading(false);
      return;
    }

    fetch(`/api/bookings?id=${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.booking) {
          setBooking(data.booking);
          if (data.booking.paymentStatus === 'ADVANCE_PAID') {
            setIsSuccess(true);
          }
        } else {
          setError(data.error || 'Booking record could not be found');
        }
      })
      .catch(() => {
        setError('Failed to fetch booking details');
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayAdvance = async () => {
    if (!booking) return;
    setPaying(true);
    setError(null);

    try {
      // 1. Create order on server
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // If mock environment or developer simulation
      if (orderData.isMock || !window.Razorpay) {
        const verifyRes = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: `mock_sig_${Date.now()}`,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setBooking(verifyData.booking);
          setIsSuccess(true);
        } else {
          throw new Error(verifyData.error || 'Verification failed');
        }
        return;
      }

      // Standard Razorpay Checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Eswari Sound System',
        description: `25% Advance: ${booking.package.name}`,
        order_id: orderData.orderId,
        prefill: {
          name: booking.customerName,
          email: booking.customerEmail,
          contact: booking.customerPhone,
        },
        theme: {
          color: '#FFB11A',
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: booking.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setBooking(verifyData.booking);
              setIsSuccess(true);
            }
          } catch (err) {
            console.error('Payment verification error:', err);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center gap-2 text-amber font-mono text-spec">
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
        <span>Loading production order details…</span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container-page pt-28 pb-24 max-w-2xl">
        <span className="label label-amber">Payment desk</span>
        <h1 className="font-heading text-h1 text-white mt-4">Order not found</h1>
        <div className="alert alert-error mt-6" role="alert">
          {error || 'Invalid booking identifier'}
        </div>
        <Link href="/book" className="btn-primary mt-8">
          <span>Start a new booking</span>
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    );
  }

  // SUCCESS CONFIRMATION RECEIPT SCREEN
  if (isSuccess) {
    return (
      <div className="container-page pt-24 lg:pt-32 pb-24 max-w-3xl">
        <span className="label label-amber">Advance cleared · date locked</span>
        <h1 className="font-heading text-h1 text-white mt-4">
          Your date is on the calendar
        </h1>
        <p className="mt-4 text-body text-fg-muted leading-relaxed max-w-measure">
          Payment verified. The rig, crew and generators are now held against
          your event date; the balance settles on site after sound-check.
        </p>
        <p className="mt-4 label">
          Payment ref ·{' '}
          <span className="text-amber">
            {booking.paymentId || booking.razorpayPaymentId || 'Verified transaction'}
          </span>
        </p>

        {/* Printable receipt — open document on hairlines */}
        <div className="mt-12 border-t border-white/[0.12] pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.12] pb-5">
            <div>
              <h2 className="font-heading text-h3 text-white">
                Eswari Sound System
              </h2>
              <p className="mt-1.5 label">Official booking token #{booking.id}</p>
            </div>
            <button onClick={() => window.print()} className="link-arrow shrink-0">
              <Printer className="w-3.5 h-3.5" aria-hidden />
              <span>Print receipt</span>
            </button>
          </div>

          <div className="text-small">
            <div className="border-b border-white/[0.12] py-4 flex flex-wrap justify-between gap-4">
              <span className="label">Customer</span>
              <span className="text-right">
                <span className="block text-white font-medium">
                  {booking.customerName}
                </span>
                <span className="block font-mono text-fg-muted mt-0.5">
                  {booking.customerPhone} · {booking.customerEmail}
                </span>
              </span>
            </div>
            <div className="border-b border-white/[0.12] py-4 flex flex-wrap justify-between gap-4">
              <span className="label">Event date &amp; venue</span>
              <span className="text-right max-w-[60%]">
                <span className="block font-mono text-amber">
                  {new Date(booking.eventDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="block text-fg-soft mt-0.5">
                  {booking.venueAddress}
                </span>
              </span>
            </div>
            <div className="border-b border-white/[0.12] py-4 flex justify-between gap-4">
              <span className="label">Reserved rig package</span>
              <span className="text-white font-medium text-right">
                {booking.package?.name || booking.packageName}
              </span>
            </div>
            <div className="border-b border-white/[0.12] py-4 flex justify-between gap-4">
              <span className="label">Full stage rental day rate</span>
              <span className="font-mono text-white tabular-nums">
                {formatINR(booking.totalAmount)}
              </span>
            </div>
            <div className="border-b border-white/[0.12] py-4 flex justify-between gap-4">
              <span className="label label-amber">25% advance paid</span>
              <span className="font-mono text-amber font-bold tabular-nums">
                {formatINR(booking.advanceAmount)}
              </span>
            </div>
            <div className="py-4 flex justify-between gap-4">
              <span className="label">Balance due on event day (75%)</span>
              <span className="font-mono text-fg-soft tabular-nums">
                {formatINR(booking.balanceAmount)}
              </span>
            </div>
          </div>

          <div className="border-t border-white/[0.12] pt-5 flex flex-wrap items-center justify-between gap-4">
            <span className="label label-amber flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
              <span>Date locked in warehouse schedule</span>
            </span>
            <span className="label">Lead sound engineer assigned</span>
          </div>
        </div>

        <div className="mt-10">
          <Link href="/my-bookings" className="link-arrow">
            <span>View in the order tracker</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  // PENDING PAYMENT SCREEN
  const isAwaitingCall = booking.status === 'PENDING';

  return (
    <div className="container-page pt-24 lg:pt-32 pb-24 max-w-3xl">
      <span className="label label-amber">Final step · secure date lock</span>
      <h1 className="font-heading text-h1 text-white mt-4">
        25% advance deposit
      </h1>
      <p className="mt-4 text-body text-fg-muted leading-relaxed max-w-measure">
        The deposit assigns the fleet and locks your date on the operations
        calendar. Balance is settled on site after sound-check, before doors.
      </p>

      {/* Status strips, not panels */}
      {isAwaitingCall ? (
        <div className="alert mt-8">
          <p className="font-heading text-base font-bold text-white">
            Step 2 — operations phone call in progress
          </p>
          <p className="mt-1.5 leading-relaxed">
            Our operations manager is verifying{' '}
            <strong className="text-white">{booking.package?.name}</strong>. We
 call{' '}
            <strong className="text-white font-mono">
              {booking.customerPhone}
            </strong>{' '}
            to confirm venue power (3-phase or single-phase) and arrival timing.
          </p>
          <div className="mt-3.5 flex flex-wrap items-center gap-5">
            <a href="tel:+919876543210" className="link-arrow label-amber">
              <Phone className="w-3.5 h-3.5" aria-hidden />
              <span>Call dispatch now</span>
            </a>
            <span className="label">Already spoke with us? Pay below.</span>
          </div>
        </div>
      ) : (
        <div className="alert alert-success mt-8" role="status">
          <strong className="text-white font-semibold">
            Order confirmed by phone.
          </strong>{' '}
          Venue and power verified — pay the 25% advance below to lock the date.
        </div>
      )}

      {error && (
        <div className="alert alert-error mt-6" role="alert">
          {error}
        </div>
      )}

      {/* Order summary — open rows on hairlines */}
      <div className="mt-12 border-t border-white/[0.12] pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/[0.12] pb-5">
          <div>
            <span className="label">Rig package</span>
            <h2 className="font-heading text-h3 text-white mt-1.5">
              {booking.package?.name}
            </h2>
          </div>
          <span className="font-mono text-small text-amber">
            {new Date(booking.eventDate).toDateString()}
          </span>
        </div>

        <div className="text-small">
          <div className="border-b border-white/[0.12] py-4 flex justify-between gap-4">
            <span className="label">Full stage rental</span>
            <span className="font-mono text-fg-soft tabular-nums">
              {formatINR(booking.totalAmount)}
            </span>
          </div>
          <div className="border-b border-white/[0.12] py-4 flex items-baseline justify-between gap-4">
            <span className="label label-amber">Payable now (25% advance)</span>
            <span className="font-heading text-h3 font-black text-amber tabular-nums">
              {formatINR(booking.advanceAmount)}
            </span>
          </div>
          <div className="py-4 flex justify-between gap-4">
            <span className="label">Balance remaining on event day</span>
            <span className="font-mono text-fg-soft tabular-nums">
              {formatINR(booking.balanceAmount)}
            </span>
          </div>
        </div>

        <div className="border-t border-white/[0.12] pt-5 space-y-2.5">
          <p className="label flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber shrink-0" aria-hidden />
            <span>Escrow protected via Razorpay Secure</span>
          </p>
          <p className="label flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber shrink-0" aria-hidden />
            <span>Calendar blackout applied the moment payment clears</span>
          </p>
        </div>

        <button
          onClick={handlePayAdvance}
          disabled={paying}
          className="btn-primary w-full mt-8"
        >
          {paying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              <span>Contacting Razorpay…</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" aria-hidden />
              <span>Pay {formatINR(booking.advanceAmount)} &amp; lock date</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-amber font-mono text-xs">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <PaymentScreen />
    </Suspense>
  );
}
