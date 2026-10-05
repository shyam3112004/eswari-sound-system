import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, USER_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  const cookieOptions = {
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    ...cookieOptions,
  });

  response.cookies.set({
    name: USER_COOKIE_NAME,
    ...cookieOptions,
  });

  return response;
}

