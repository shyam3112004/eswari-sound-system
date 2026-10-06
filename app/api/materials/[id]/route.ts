import { NextRequest, NextResponse } from 'next/server';
import {
  getMaterialByIdSafe,
  updateMaterialSafe,
  deleteMaterialSafe,
  UpdateMaterialInput,
} from '@/lib/materialsStore';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const material = await getMaterialByIdSafe(params.id);

    if (!material) {
      return NextResponse.json(
        {
          success: false,
          error: 'Material not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      material,
    });
  } catch (error: any) {
    console.error('Material API GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch material',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const { name, category, description, pricePerDay, unit, isAvailable, sortOrder } = body;

    const updateInput: UpdateMaterialInput = {};
    
    if (name !== undefined) updateInput.name = name;
    if (category !== undefined) updateInput.category = category;
    if (description !== undefined) updateInput.description = description;
    if (typeof pricePerDay === 'number') updateInput.pricePerDay = Math.round(pricePerDay);
    if (unit !== undefined) updateInput.unit = unit;
    if (isAvailable !== undefined) updateInput.isAvailable = isAvailable;
    if (sortOrder !== undefined) updateInput.sortOrder = sortOrder;

    const material = await updateMaterialSafe(params.id, updateInput);

    if (!material) {
      return NextResponse.json(
        {
          success: false,
          error: 'Material not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      material,
    });
  } catch (error: any) {
    console.error('Material API PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update material',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteMaterialSafe(params.id);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete material or material not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (error: any) {
    console.error('Material API DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete material',
      },
      { status: 500 }
    );
  }
}