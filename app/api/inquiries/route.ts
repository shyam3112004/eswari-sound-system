import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inquirySchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = inquirySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message || 'Invalid inquiry form data',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const eventDate = data.eventDate ? new Date(data.eventDate) : null;

    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        eventType: data.eventType.trim(),
        eventDate,
        venue: data.venue?.trim() || null,
        message: data.message.trim(),
        status: 'NEW',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been submitted. Our production head will contact you within 24 hours with a custom quotation.',
        inquiryId: inquiry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process event inquiry' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve inquiries' },
      { status: 500 }
    );
  }
}
