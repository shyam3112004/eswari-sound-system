import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession, ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { inquiryId, quoteAmount, quoteDetails, status, adminNotes } = body;

    if (!inquiryId) {
      return NextResponse.json({ success: false, error: 'Inquiry ID is required' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (quoteAmount !== undefined) dataToUpdate.quoteAmount = quoteAmount;
    if (quoteDetails !== undefined) dataToUpdate.quoteDetails = quoteDetails;
    if (adminNotes !== undefined) dataToUpdate.adminNotes = adminNotes;
    if (status) dataToUpdate.status = status;
    else if (quoteAmount) dataToUpdate.status = 'QUOTED';

    const updated = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry quote updated successfully',
      inquiry: updated,
    });
  } catch (error) {
    console.error('Update inquiry error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update inquiry' }, { status: 500 });
  }
}
