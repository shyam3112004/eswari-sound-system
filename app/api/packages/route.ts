import { NextResponse } from 'next/server';
import { getAllPackages } from '@/lib/db';

export async function GET() {
  try {
    const packages = await getAllPackages();
    return NextResponse.json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve packages' },
      { status: 500 }
    );
  }
}
