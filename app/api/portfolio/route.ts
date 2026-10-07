import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_PORTFOLIO } from '@/lib/defaultPortfolio';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }

    let items;
    try {
      items = await prisma.portfolioItem.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });
    } catch (err) {
      // Serverless runtimes cannot open a bundled SQLite file. Degrade to the
      // curated defaults like every other read path (packages, availability,
      // materials) instead of returning a 500.
      console.warn('Portfolio DB unavailable, serving curated defaults:', err);
      const defaults = DEFAULT_PORTFOLIO.map((item, i) => ({
        id: `default-${i + 1}`,
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
      })).filter((item) => !category || category === 'all' || item.category === category);
      return NextResponse.json({ success: true, items: defaults });
    }

    // If the database has 0 items, seed the default portfolio so the gallery
    // is never empty. Serverless filesystems are read-only: if the write fails
    // we still return a healthy empty response instead of a 500.
    if (items.length === 0 && (!category || category === 'all')) {
      try {
        for (const item of DEFAULT_PORTFOLIO) {
          await prisma.portfolioItem.create({ data: item });
        }
        items = await prisma.portfolioItem.findMany({
          where,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
      } catch (err) {
        // Read-only runtime (e.g. serverless): defaults should already have
        // been baked in at build time by prisma/seed.ts.
        console.error('Portfolio default seed skipped:', err);
        items = DEFAULT_PORTFOLIO.map((item, i) => ({
          id: `default-${i + 1}`,
          ...item,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }
    }

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Fetch portfolio error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio items' },
      { status: 500 }
    );
  }
}
