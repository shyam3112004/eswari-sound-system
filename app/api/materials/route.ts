import { NextRequest, NextResponse } from 'next/server';
import {
  getAllMaterialsSafe,
  createMaterialSafe,
  CreateMaterialInput,
} from '@/lib/materialsStore';
import { verifySession, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  try {
    const materials = await getAllMaterialsSafe();
    
    return NextResponse.json({
      success: true,
      materials,
    });
  } catch (error: any) {
    console.error('Materials API GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch materials',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    
    const { name, category, description, pricePerDay, unit, isAvailable, sortOrder, images } = body;

    if (!name || !category || !description || typeof pricePerDay !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, category, description, pricePerDay',
        },
        { status: 400 }
      );
    }

    const materialInput: CreateMaterialInput = {
      name,
      category,
      description,
      pricePerDay: Math.round(pricePerDay), // Ensure it's in paise
      unit: unit || 'unit',
      isAvailable: isAvailable ?? true,
      sortOrder: sortOrder ?? 0,
      images: Array.isArray(images) ? images.filter((u: unknown) => typeof u === 'string' && u) : null,
    };

    const material = await createMaterialSafe(materialInput);

    return NextResponse.json({
      success: true,
      material,
    });
  } catch (error: any) {
    console.error('Materials API POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create material',
      },
      { status: 500 }
    );
  }
}
