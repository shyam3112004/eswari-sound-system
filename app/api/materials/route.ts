import { NextRequest, NextResponse } from 'next/server';
import {
  getAllMaterialsSafe,
  createMaterialSafe,
  CreateMaterialInput,
} from '@/lib/materialsStore';

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
    const body = await request.json();
    
    const { name, category, description, pricePerDay, unit, isAvailable, sortOrder } = body;

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