import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPaymentOrder } from '@/lib/razorpay';
import { getBookingByIdSafe, updateBookingStatusSafe } from '@/lib/bookingsStore';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
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

    if (booking.paymentStatus === 'ADVANCE_PAID' || booking.paymentStatus === 'FULLY_PAID') {
      return NextResponse.json(
        { success: false, error: 'Advance has already been paid for this booking' },
        { status: 400 }
      );
    }

    // Generate Razorpay Order strictly using server-calculated advanceAmount
    const eventDateStr = booking.eventDate instanceof Date
      ? booking.eventDate.toISOString().split('T')[0]
      : String(booking.eventDate).split('T')[0];
    const pkgName = booking.package?.name || 'Sound Rig';

    const order = await createPaymentOrder({
      amountInPaise: booking.advanceAmount,
      receiptId: booking.id,
      notes: {
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        package: pkgName,
        eventDate: eventDateStr,
      },
    });

    // Save generated order ID
    await updateBookingStatusSafe(booking.id, { razorpayOrderId: order.id });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: booking.advanceAmount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dev',
      isMock: Boolean((order as any).isMock),
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        eventDate: eventDateStr,
        venueAddress: booking.venueAddress,
        packageName: pkgName,
        totalAmount: booking.totalAmount,
        advanceAmount: booking.advanceAmount,
        balanceAmount: booking.balanceAmount,
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate payment gateway order' },
      { status: 500 }
    );
  }
}
