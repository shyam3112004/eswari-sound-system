import { NextRequest, NextResponse } from 'next/server';
import { verifySession, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin session
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const { valid } = verifySession(token);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // 3. Determine media type and extension
    const mimeType = file.type.toLowerCase();
    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Only image or video files are allowed.' },
        { status: 400 }
      );
    }

    const mediaType = isVideo ? 'video' : 'image';

    // File extension extraction and fallback
    const originalExt = path.extname(file.name).toLowerCase();
    let ext = originalExt;
    if (!ext) {
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
      else if (mimeType.includes('png')) ext = '.png';
      else if (mimeType.includes('webp')) ext = '.webp';
      else if (mimeType.includes('mp4')) ext = '.mp4';
      else if (mimeType.includes('webm')) ext = '.webm';
      else ext = isVideo ? '.mp4' : '.jpg';
    }

    // 4. Generate clean safe filename
    const safeBase = file.name
      .replace(originalExt, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const finalFilename = `${safeBase}_${uniqueSuffix}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'portfolio');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, finalFilename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/portfolio/${finalFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: finalFilename,
      mediaType,
      size: file.size,
    });
  } catch (error) {
    console.error('Portfolio upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
