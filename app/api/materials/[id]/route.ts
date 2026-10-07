import { NextRequest, NextResponse } from 'next/server';
import {
  getMaterialByIdSafe,
  updateMaterialSafe,
  deleteMaterialSafe,
  UpdateMaterialInput,
} from '@/lib/materialsStore';
import { verifySession, ADMIN_COOKIE_NAME } from '@/lib/auth';

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
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    
    const { name, category, description, pricePerDay, unit, isAvailable, sortOrder, images } = body;

    const updateInput: UpdateMaterialInput = {};
    
    if (name !== undefined) updateInput.name = name;
    if (category !== undefined) updateInput.category = category;
    if (description !== undefined) updateInput.description = description;
    if (typeof pricePerDay === 'number') updateInput.pricePerDay = Math.round(pricePerDay);
    if (unit !== undefined) updateInput.unit = unit;
    if (isAvailable !== undefined) updateInput.isAvailable = isAvailable;
    if (sortOrder !== undefined) updateInput.sortOrder = sortOrder;
    if (images !== undefined) updateInput.images = Array.isArray(images) ? images.filter((u: unknown) => typeof u === 'string' && u) : [];

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
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

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
