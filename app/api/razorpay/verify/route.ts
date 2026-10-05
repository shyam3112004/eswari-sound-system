import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPaymentSignature } from '@/lib/razorpay';

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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { package: true },
    });

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
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'ADVANCE_PAID',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      },
      include: { package: true },
    });

    // 2. Lock the date permanently in Availability to prevent double-booking
    await prisma.availability.upsert({
      where: { date: booking.eventDate },
      update: {
        isBlocked: true,
        reason: `Confirmed Booking #${booking.id} (${booking.customerName})`,
      },
      create: {
        date: booking.eventDate,
        isBlocked: true,
        reason: `Confirmed Booking #${booking.id} (${booking.customerName})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Advance payment confirmed and event date locked successfully.',
      booking: {
        id: updatedBooking.id,
        customerName: updatedBooking.customerName,
        customerEmail: updatedBooking.customerEmail,
        customerPhone: updatedBooking.customerPhone,
        eventDate: updatedBooking.eventDate.toISOString().split('T')[0],
        venueAddress: updatedBooking.venueAddress,
        packageName: updatedBooking.package.name,
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
