import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bookingSchema } from '@/lib/validations';
import { isDateBlocked } from '@/lib/db';
import { sendAdminNewBookingAlert } from '@/lib/email';
import { createBookingSafe, getBookingByIdSafe } from '@/lib/bookingsStore';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message || 'Invalid booking request',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const eventDate = new Date(data.eventDate);

    // 1. Verify date availability
    const availability = await isDateBlocked(eventDate);
    if (availability.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: availability.reason || 'The requested date is not available.',
        },
        { status: 409 }
      );
    }

    // 2. Create Draft Booking with resilient store & database fallback
    const booking = await createBookingSafe({
      packageSlug: data.packageSlug,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      eventDate,
      venueAddress: data.venueAddress,
      eventType: data.eventType,
      notes: data.notes,
    });

    // Notify staff/admin immediately so they can call customer to confirm
    sendAdminNewBookingAlert({
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      packageName: booking.package?.name || 'Sound System Rig',
      eventDate: booking.eventDate instanceof Date ? booking.eventDate.toISOString().split('T')[0] : String(booking.eventDate).split('T')[0],
      venueAddress: booking.venueAddress,
      bookingId: booking.id,
    }).catch((err) => console.warn('Admin alert email error:', err));

    return NextResponse.json(
      {
        success: true,
        message: 'Draft booking created successfully. Advance payment required to confirm.',
        booking: {
          id: booking.id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          eventDate: booking.eventDate instanceof Date ? booking.eventDate.toISOString().split('T')[0] : String(booking.eventDate).split('T')[0],
          venueAddress: booking.venueAddress,
          packageName: booking.package?.name || 'Sound Rig Package',
          packageSlug: booking.package?.slug || data.packageSlug,
          totalAmount: booking.totalAmount,
          advanceAmount: booking.advanceAmount,
          balanceAmount: booking.balanceAmount,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt,
        },
        advanceRequired: booking.advanceAmount,
        balanceDue: booking.balanceAmount,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create booking draft' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');

    if (id) {
      const booking = await getBookingByIdSafe(id);

      if (!booking) {
        return NextResponse.json(
          { success: false, error: 'Booking not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, booking });
    }

    const whereClause: { customerPhone?: string; customerEmail?: string } = {};
    if (phone) whereClause.customerPhone = phone.trim();
    if (email) whereClause.customerEmail = email.toLowerCase().trim();

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: { package: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve bookings' },
      { status: 500 }
    );
  }
}
