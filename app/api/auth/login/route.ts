import { NextRequest, NextResponse } from 'next/server';
import {
  checkAdminCredentials,
  isAdminEmail,
  signSession,
  signUserSession,
  ADMIN_COOKIE_NAME,
  USER_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPass = password.trim();

    // 1. If this is an Admin email address
    if (isAdminEmail(cleanEmail)) {
      const isValidAdmin = checkAdminCredentials(cleanEmail, cleanPass);
      if (!isValidAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: 'Incorrect master password for admin account. Access denied.',
          },
          { status: 401 }
        );
      }

      // Admin password is valid -> Issue Admin Session
      const adminToken = signSession({
        email: cleanEmail,
        role: 'admin',
      });

      const response = NextResponse.json({
        success: true,
        role: 'admin',
        isAdmin: true,
        redirectTo: '/admin',
        message: 'Master password verified. Automatically opening Admin Console...',
        user: {
          id: 'admin_master',
          email: cleanEmail,
          name: 'Sound Master Admin',
          role: 'admin',
          isAdmin: true,
        },
      });

      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: adminToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_DURATION_SECONDS,
      });

      // Clear customer cookie
      response.cookies.set({
        name: USER_COOKIE_NAME,
        value: '',
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    // 2. Regular Customer Login / Sign-up with Email & Password
    if (cleanPass.length < 4) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 4 characters long' },
        { status: 400 }
      );
    }

    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0];
    const customerToken = signUserSession({
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      name: cleanName,
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=ffb11a&textColor=070709`,
      role: 'customer',
    });

    const response = NextResponse.json({
      success: true,
      role: 'customer',
      isAdmin: false,
      redirectTo: '/',
      message: 'Sign in successful. Redirecting to Experience tab...',
      user: {
        id: `usr_${Date.now()}`,
        email: cleanEmail,
        name: cleanName,
        role: 'customer',
        isAdmin: false,
      },
    });

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: customerToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
    });

    // Clear admin cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: '',
      path: '/',
      maxAge: 0,
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
