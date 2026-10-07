import { NextRequest, NextResponse } from 'next/server';
import {
  getAllMaterialsForAdminSafe,
  createMaterialSafe,
  CreateMaterialInput,
} from '@/lib/materialsStore';
import { verifySession, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  try {
    const materials = await getAllMaterialsForAdminSafe();
    
    return NextResponse.json({
      success: true,
      materials,
    });
  } catch (error: any) {
    console.error('Admin Materials API GET error:', error);
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

    // Convert rupees to paise if needed
    const priceInPaise = pricePerDay > 1000 ? Math.round(pricePerDay) : Math.round(pricePerDay * 100);

    const materialInput: CreateMaterialInput = {
      name,
      category,
      description,
      pricePerDay: priceInPaise,
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
    console.error('Admin Materials API POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create material',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, category, description, pricePerDay, unit, isAvailable, sortOrder, images } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing material ID' },
        { status: 400 }
      );
    }

    const { updateMaterialSafe } = await import('@/lib/materialsStore');
    const updateInput: any = {};
    if (name !== undefined) updateInput.name = name.trim();
    if (category !== undefined) updateInput.category = category.trim();
    if (description !== undefined) updateInput.description = description.trim();
    if (typeof pricePerDay === 'number') {
      updateInput.pricePerDay = pricePerDay > 1000 ? Math.round(pricePerDay) : Math.round(pricePerDay * 100);
    }
    if (unit !== undefined) updateInput.unit = unit;
    if (isAvailable !== undefined) updateInput.isAvailable = Boolean(isAvailable);
    if (sortOrder !== undefined) updateInput.sortOrder = Number(sortOrder);
    if (images !== undefined) updateInput.images = Array.isArray(images) ? images.filter((u: unknown) => typeof u === 'string' && u) : [];

    const updated = await updateMaterialSafe(id, updateInput);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Material not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      material: updated,
    });
  } catch (error: any) {
    console.error('Admin Materials API PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update material' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing material ID in query string' },
        { status: 400 }
      );
    }

    const { deleteMaterialSafe } = await import('@/lib/materialsStore');
    const success = await deleteMaterialSafe(id);

    return NextResponse.json({
      success: true,
      message: success ? 'Material deleted successfully' : 'Material removed from catalog',
    });
  } catch (error: any) {
    console.error('Admin Materials API DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete material' },
      { status: 500 }
    );
  }
}
