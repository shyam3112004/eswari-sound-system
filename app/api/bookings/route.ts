import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bookingSchema } from '@/lib/validations';
import { isDateBlocked } from '@/lib/db';

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

    // 2. Fetch canonical package to calculate price server-side
    const pkg = await prisma.package.findUnique({
      where: { slug: data.packageSlug },
    });

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: 'Selected package was not found in catalog.' },
        { status: 404 }
      );
    }

    // 3. Strict Server-Side Financial Calculations (25% advance rule)
    const totalAmount = pkg.price;
    const advanceAmount = Math.round(totalAmount * 0.25);
    const balanceAmount = totalAmount - advanceAmount;

    // 4. Create Draft Booking
    const booking = await prisma.booking.create({
      data: {
        packageId: pkg.id,
        customerName: data.customerName.trim(),
        customerEmail: data.customerEmail.toLowerCase().trim(),
        customerPhone: data.customerPhone.trim(),
        eventDate,
        venueAddress: data.venueAddress.trim(),
        eventType: data.eventType?.trim() || 'Live Stage Production',
        totalAmount,
        advanceAmount,
        balanceAmount,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        notes: data.notes?.trim() || null,
      },
      include: {
        package: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Draft booking created successfully. Advance payment required to confirm.',
        booking: {
          id: booking.id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          eventDate: booking.eventDate.toISOString().split('T')[0],
          venueAddress: booking.venueAddress,
          packageName: pkg.name,
          packageSlug: pkg.slug,
          totalAmount: booking.totalAmount,
          advanceAmount: booking.advanceAmount,
          balanceAmount: booking.balanceAmount,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt,
        },
        advanceRequired: advanceAmount,
        balanceDue: balanceAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking draft' },
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
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: { package: true },
      });

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
