import { NextRequest, NextResponse } from 'next/server';
import {
  verifyUserSession,
  verifySession,
  USER_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // 1. Check User/Customer Cookie
  const userToken = request.cookies.get(USER_COOKIE_NAME)?.value;
  if (userToken) {
    const { valid, session } = verifyUserSession(userToken);
    if (valid && session) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: session.id,
          name: session.name,
          email: session.email,
          picture: session.picture,
          role: 'customer',
          isAdmin: false,
        },
      });

    }
  }

  // 2. Check Admin Cookie fallback
  const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (adminToken) {
    const { valid, session } = verifySession(adminToken);
    if (valid && session) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: 'admin_master',
          name: 'Sound Master Admin',
          email: session.email,
          role: 'admin',
          isAdmin: true,
        },
      });
    }
  }

  return NextResponse.json({
    authenticated: false,
    user: null,
  });
}
