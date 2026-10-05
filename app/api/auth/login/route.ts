import { NextRequest, NextResponse } from 'next/server';
import {
  checkAdminCredentials,
  signSession,
  ADMIN_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const isValid = checkAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    const token = signSession({
      email: email.toLowerCase().trim(),
      role: 'admin',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Admin access granted',
      user: {
        email: email.toLowerCase().trim(),
        role: 'admin',
      },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
