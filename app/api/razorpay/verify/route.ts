import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { sendBookingReceiptEmail } from '@/lib/email';
import { getBookingByIdSafe, updateBookingStatusSafe } from '@/lib/bookingsStore';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification parameters' },
        { status: 400 }
      );
    }

    const booking = await getBookingByIdSafe(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Cryptographic verification
    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature. Verification rejected.' },
        { status: 400 }
      );
    }

    // 1. Update Booking status to CONFIRMED and paymentStatus to ADVANCE_PAID
    const updatedBooking = await updateBookingStatusSafe(booking.id, {
      status: 'CONFIRMED',
      paymentStatus: 'ADVANCE_PAID',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    // 2. Lock the date in Availability if db is alive
    try {
      const eventDateObj = booking.eventDate instanceof Date ? booking.eventDate : new Date(booking.eventDate);
      await prisma.availability.upsert({
        where: { date: eventDateObj },
        update: {
          isBlocked: true,
          reason: `Confirmed Booking #${booking.id} (${booking.customerName})`,
        },
        create: {
          date: eventDateObj,
          isBlocked: true,
          reason: `Confirmed Booking #${booking.id} (${booking.customerName})`,
        },
      });
    } catch (availErr) {
      console.warn('Prisma availability lock fallback:', availErr);
    }

    const eventDateStr = updatedBooking.eventDate instanceof Date
      ? updatedBooking.eventDate.toISOString().split('T')[0]
      : String(updatedBooking.eventDate).split('T')[0];
    const pkgName = updatedBooking.package?.name || 'Sound Rig';

    // 3. Send official booking confirmation email receipt asynchronously
    sendBookingReceiptEmail({
      customerName: updatedBooking.customerName,
      customerEmail: updatedBooking.customerEmail,
      bookingId: updatedBooking.id,
      packageName: pkgName,
      eventDate: eventDateStr,
      venueAddress: updatedBooking.venueAddress,
      totalAmount: updatedBooking.totalAmount,
      advanceAmount: updatedBooking.advanceAmount,
      balanceAmount: updatedBooking.balanceAmount,
    }).catch((err) => console.warn('Receipt email dispatch error:', err));

    return NextResponse.json({
      success: true,
      message: 'Advance payment confirmed and event date locked successfully.',
      booking: {
        id: updatedBooking.id,
        customerName: updatedBooking.customerName,
        customerEmail: updatedBooking.customerEmail,
        customerPhone: updatedBooking.customerPhone,
        eventDate: eventDateStr,
        venueAddress: updatedBooking.venueAddress,
        packageName: pkgName,
        totalAmount: updatedBooking.totalAmount,
        advanceAmount: updatedBooking.advanceAmount,
        balanceAmount: updatedBooking.balanceAmount,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
        paymentId: updatedBooking.razorpayPaymentId,
      },
    });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment transaction' },
      { status: 500 }
    );
  }
}

