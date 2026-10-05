import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession, ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const bookings = await prisma.booking.findMany({
      include: { package: true },
      orderBy: { eventDate: 'asc' },
    });
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

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: dataToUpdate,
      include: { package: true },
    });

    // If advance is marked paid, ensure the date is blocked in availability
    if (paymentStatus === 'ADVANCE_PAID' || status === 'CONFIRMED') {
      try {
        await prisma.availability.upsert({
          where: { date: updated.eventDate },
          update: {
            isBlocked: true,
            reason: `Booked: ${updated.customerName} (${updated.package.name})`,
          },
          create: {
            date: updated.eventDate,
            isBlocked: true,
            reason: `Booked: ${updated.customerName} (${updated.package.name})`,
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

