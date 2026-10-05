import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { unlink } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const items = await prisma.portfolioItem.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Admin fetch portfolio error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      category,
      location,
      crowd,
      specs,
      tag,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      eventDate,
      sortOrder,
    } = body;

    if (!title || !category || !location || !mediaUrl) {
      return NextResponse.json(
        { success: false, error: 'Title, category, location, and media file/URL are required' },
        { status: 400 }
      );
    }

    const created = await prisma.portfolioItem.create({
      data: {
        title: title.trim(),
        category: category.trim(),
        location: location.trim(),
        crowd: crowd ? crowd.trim() : null,
        specs: specs ? specs.trim() : null,
        tag: tag ? tag.trim() : null,
        mediaType: mediaType === 'video' ? 'video' : 'image',
        mediaUrl: mediaUrl.trim(),
        thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : null,
        eventDate: eventDate ? new Date(eventDate) : null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
    });

    return NextResponse.json({ success: true, item: created });
  } catch (error) {
    console.error('Admin create portfolio error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create portfolio item' },
      { status: 500 }
    );
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing portfolio item ID' }, { status: 400 });
    }

    const existing = await prisma.portfolioItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    // Attempt to remove local file if stored in /uploads/portfolio/
    if (existing.mediaUrl && existing.mediaUrl.startsWith('/uploads/portfolio/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', existing.mediaUrl);
        await unlink(filePath);
      } catch (err) {
        // Log but don't fail database deletion if file was already moved
        console.warn('Could not remove file on disk:', err);
      }
    }

    await prisma.portfolioItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Portfolio item deleted successfully' });
  } catch (error) {
    console.error('Admin delete portfolio error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete portfolio item' },
      { status: 500 }
    );
  }
}
