import { NextRequest, NextResponse } from 'next/server';
import { getAllBookingsSafe } from '@/lib/bookingsStore';

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
    const cleanPhone = query.replace(/\D/g, '');
    const cleanEmail = query.toLowerCase();

    const allBookings = await getAllBookingsSafe();
    const matching = allBookings.filter((b: any) => {
      if (isEmail) {
        return b.customerEmail?.toLowerCase() === cleanEmail;
      }
      return b.customerPhone?.replace(/\D/g, '') === cleanPhone;
    });

    const sanitizedBookings = matching.map((b: any) => ({
      id: b.id,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      customerEmail: b.customerEmail,
      eventDate: b.eventDate instanceof Date ? b.eventDate.toISOString().split('T')[0] : String(b.eventDate).split('T')[0],
      venueAddress: b.venueAddress,
      packageName: b.package?.name || 'Sound Package',
      packageCategory: b.package?.category || 'combo',
      totalAmount: b.totalAmount,
      advanceAmount: b.advanceAmount,
      balanceAmount: b.balanceAmount,
      status: b.status,
      paymentStatus: b.paymentStatus,
      bookingMaterials: b.bookingMaterials || [],
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

