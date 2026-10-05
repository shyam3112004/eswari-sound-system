import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { getAllBookingsSafe, updateBookingStatusSafe } from '@/lib/bookingsStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const bookings = await getAllBookingsSafe();
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Fetch admin bookings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, status, paymentStatus, notes } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Booking ID is required' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (paymentStatus) dataToUpdate.paymentStatus = paymentStatus;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const updated = await updateBookingStatusSafe(bookingId, dataToUpdate);

    // If advance is marked paid, ensure the date is blocked in availability
    if (paymentStatus === 'ADVANCE_PAID' || status === 'CONFIRMED') {
      try {
        const dateObj = updated.eventDate instanceof Date ? updated.eventDate : new Date(updated.eventDate);
        await prisma.availability.upsert({
          where: { date: dateObj },
          update: {
            isBlocked: true,
            reason: `Booked: ${updated.customerName} (${updated.package?.name || 'Sound Package'})`,
          },
          create: {
            date: dateObj,
            isBlocked: true,
            reason: `Booked: ${updated.customerName} (${updated.package?.name || 'Sound Package'})`,
          },
        });
      } catch (availErr) {
        console.error('Availability update note:', availErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updated,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 });
  }
}


