import { NextRequest, NextResponse } from 'next/server';
import { availabilityCheckSchema } from '@/lib/validations';
import { isDateBlocked } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = availabilityCheckSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.errors[0]?.message || 'Invalid date format',
        },
        { status: 400 }
      );
    }

    const targetDate = new Date(result.data.date);
    const { isBlocked, reason } = await isDateBlocked(targetDate);

    return NextResponse.json({
      success: true,
      date: result.data.date,
      available: !isBlocked,
      reason: isBlocked ? reason : 'Date is open for booking',
    });
  } catch (error) {
    console.error('Availability check failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error checking availability' },
      { status: 500 }
    );
  }
}
