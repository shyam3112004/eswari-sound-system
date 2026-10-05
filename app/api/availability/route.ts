import { NextRequest, NextResponse } from 'next/server';
import { getBlockedDatesInRange } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month'); // Format: YYYY-MM

    let startDate: Date;
    let endDate: Date;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split('-').map(Number);
      startDate = new Date(Date.UTC(year, month - 1, 1));
      endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    } else {
      // Default: from today to 6 months in the future
      startDate = new Date();
      startDate.setUTCHours(0, 0, 0, 0);

      endDate = new Date();
      endDate.setUTCMonth(endDate.getUTCMonth() + 6);
      endDate.setUTCHours(23, 59, 59, 999);
    }

    const blockedDates = await getBlockedDatesInRange(startDate, endDate);

    return NextResponse.json({
      success: true,
      range: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      },
      count: blockedDates.length,
      blockedDates,
    });
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve calendar availability' },
      { status: 500 }
    );
  }
}
