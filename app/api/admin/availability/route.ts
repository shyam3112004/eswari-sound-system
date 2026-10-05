import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession, ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, reason } = body;

    if (!date) {
      return NextResponse.json({ success: false, error: 'Date is required' }, { status: 400 });
    }

    const blackoutDate = new Date(date);
    blackoutDate.setUTCHours(0, 0, 0, 0);

    const record = await prisma.availability.upsert({
      where: { date: blackoutDate },
      update: { isBlocked: true, reason: reason || 'Admin Blackout' },
      create: { date: blackoutDate, isBlocked: true, reason: reason || 'Admin Blackout' },
    });

    return NextResponse.json({
      success: true,
      message: 'Date added to blackout calendar',
      record,
    });
  } catch (error) {
    console.error('Admin availability error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update blackout calendar' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json({ success: false, error: 'Date is required' }, { status: 400 });
    }

    const targetDate = new Date(dateStr);
    targetDate.setUTCHours(0, 0, 0, 0);

    await prisma.availability.deleteMany({
      where: { date: targetDate },
    });

    return NextResponse.json({
      success: true,
      message: 'Date removed from blackout calendar',
    });
  } catch (error) {
    console.error('Delete blackout error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete blackout' }, { status: 500 });
  }
}
