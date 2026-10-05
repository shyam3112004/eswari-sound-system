import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim();

    if (!query || query.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid phone number or email address',
        },
        { status: 400 }
      );
    }

    const isEmail = query.includes('@');
    const whereCondition = isEmail
      ? { customerEmail: query.toLowerCase() }
      : { customerPhone: query.replace(/\D/g, '') };

    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      include: {
        package: true,
      },
      orderBy: {
        eventDate: 'desc',
      },
    });

    const sanitizedBookings = bookings.map((b) => ({
      id: b.id,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      customerEmail: b.customerEmail,
      eventDate: b.eventDate.toISOString().split('T')[0],
      venueAddress: b.venueAddress,
      packageName: b.package.name,
      packageCategory: b.package.category,
      totalAmount: b.totalAmount,
      advanceAmount: b.advanceAmount,
      balanceAmount: b.balanceAmount,
      status: b.status,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt,
    }));

    return NextResponse.json({
      success: true,
      count: sanitizedBookings.length,
      bookings: sanitizedBookings,
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to look up bookings' },
      { status: 500 }
    );
  }
}
