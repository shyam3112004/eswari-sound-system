'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Volume2,
  ArrowRight,
  Clock,
  Loader2,
  Printer,
  CreditCard,
  MapPin,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function PaymentScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError('No Booking ID provided in URL');
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
      .catch((err) => {
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
      <div className="min-h-[70vh] flex items-center justify-center text-amber font-mono text-xs">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading production order details...</span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-950/70 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-heading text-xl font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-neutral-400">{error || 'Invalid booking identifier'}</p>
        <Link
          href="/book"
          className="inline-block mt-4 px-6 py-2.5 rounded-full bg-amber text-ink text-xs font-semibold uppercase tracking-wider"
        >
          Start New Booking
        </Link>
      </div>
    );
  }

  // SUCCESS CONFIRMATION RECEIPT SCREEN
  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-white">
            Date Locked & Advance Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 font-mono">
            Payment Ref: <span className="text-amber">{booking.paymentId || booking.razorpayPaymentId || 'Verified Transaction'}</span>
          </p>
        </div>

        {/* Printable Official Receipt */}
        <div className="glass-card-amber rounded-3xl p-8 sm:p-10 border border-amber/30 space-y-6 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 gap-4">
            <div>
              <div className="font-heading text-xl font-bold text-white flex items-center gap-2">
                <span>ESWARI SOUND SYSTEM</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full">
                  Confirmed Order
                </span>
              </div>
              <div className="text-xs text-neutral-400 font-mono mt-0.5">
                Official Booking Token #{booking.id}
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl glass-card border border-white/20 text-xs font-mono text-neutral-200 hover:text-white flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5 text-amber" />
              <span>Print Invoice Receipt</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-neutral-400 font-mono">Customer Name:</span>
              <div className="font-medium text-white">{booking.customerName}</div>
              <div className="text-neutral-400 font-mono">{booking.customerPhone} • {booking.customerEmail}</div>
            </div>

            <div className="space-y-1">
              <span className="text-neutral-400 font-mono">Event Date & Venue:</span>
              <div className="font-bold text-amber font-mono">
                {new Date(booking.eventDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div className="text-neutral-300">{booking.venueAddress}</div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border-t border-white/10 pt-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400 font-mono">Reserved Rig Package:</span>
              <span className="font-bold text-white">{booking.package?.name || booking.packageName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-400 font-mono">Full Stage Rental Day Rate:</span>
              <span className="font-mono text-white">{formatINR(booking.totalAmount)}</span>
            </div>

            <div className="flex justify-between text-sm py-2 border-y border-white/10">
              <span className="text-emerald-400 font-mono font-bold">25% Advance Paid via Razorpay:</span>
              <span className="font-mono font-extrabold text-emerald-400">{formatINR(booking.advanceAmount)}</span>
            </div>

            <div className="flex justify-between text-neutral-300 font-mono">
              <span>Remaining Balance Due on Event Day (75%):</span>
              <span className="font-bold">{formatINR(booking.balanceAmount)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span className="flex items-center gap-1.5 text-amber">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Date Locked In Warehouse Schedule</span>
            </span>
            <span>Lead Sound Engineer Assigned</span>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/my-bookings"
            className="text-xs font-mono text-amber hover:underline inline-flex items-center gap-1.5"
          >
            <span>View In Customer Lookup Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // PENDING PAYMENT SCREEN
  const isAwaitingCall = booking.status === 'PENDING';

  return (
    <div className="max-w-xl mx-auto py-16 px-4 sm:px-6 space-y-8">
      <div className="text-center space-y-3">
        <span className="text-amber text-xs font-mono uppercase tracking-widest font-semibold">
          Final Step: Secure Date Lock
        </span>
        <h1 className="font-heading text-3xl font-extrabold text-white">
          25% Advance Deposit
        </h1>
        <p className="text-xs text-neutral-300">
          To finalize fleet assignment and lock your date on our calendar, complete the 25% deposit below.
        </p>
      </div>

      {/* Confirmation Call Notice */}
      {isAwaitingCall ? (
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-amber shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="font-heading text-sm font-bold text-white">
                Step 2: Operations Phone Call in Progress
              </h4>
              <p className="text-neutral-300 mt-1 leading-relaxed">
                Our operations manager is verifying your booking for <strong className="text-amber">{booking.package?.name}</strong>. We will call you at <strong className="text-white font-mono">{booking.customerPhone}</strong> to confirm your venue power supply (3-phase/single-phase) and timing.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber text-ink font-bold text-[11px] uppercase tracking-wider"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Dispatch Now</span>
                </a>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Already spoke with us? You can pay below.
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-white">Order Confirmed by Team:</span> Phone verification complete. Pay 25% advance below to lock date.
          </div>
        </div>
      )}

      <div className="glass-card-amber rounded-3xl p-8 border border-amber/30 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-neutral-400 text-xs font-mono block">Rig Package:</span>
            <span className="font-heading text-lg font-bold text-white">
              {booking.package?.name}
            </span>
          </div>
          <span className="text-xs font-mono text-amber px-2.5 py-1 rounded bg-amber/10 border border-amber/20">
            {new Date(booking.eventDate).toDateString()}
          </span>
        </div>

        <div className="space-y-3 text-xs border-b border-white/10 pb-4">
          <div className="flex justify-between">
            <span className="text-neutral-400 font-mono">Full Stage Rental:</span>
            <span className="font-mono text-white">{formatINR(booking.totalAmount)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="font-bold text-amber">Payable Now (25% Advance):</span>
            <span className="font-mono font-extrabold text-amber text-base">
              {formatINR(booking.advanceAmount)}
            </span>
          </div>

          <div className="flex justify-between text-neutral-400 text-[11px]">
            <span>Balance Remaining on Event Day:</span>
            <span className="font-mono text-neutral-200">{formatINR(booking.balanceAmount)}</span>
          </div>
        </div>

        <div className="space-y-2 text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Escrow protected via Razorpay Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0 text-amber" />
            <span>Instant calendar blackout lock upon payment</span>
          </div>
        </div>

        <button
          onClick={handlePayAdvance}
          disabled={paying}
          className="w-full py-4 rounded-full bg-amber text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {paying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Communicating With Razorpay...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Pay {formatINR(booking.advanceAmount)} Deposit & Lock Date</span>
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
