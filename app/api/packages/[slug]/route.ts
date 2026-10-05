import { NextRequest, NextResponse } from 'next/server';
import { getPackageBySlug } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const pkg = await getPackageBySlug(slug);

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      package: pkg,
    });
  } catch (error) {
    console.error('Failed to fetch package by slug:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve package' },
      { status: 500 }
    );
  }
}
