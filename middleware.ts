import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'eswari_admin_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes, excluding /admin/login and static assets
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (!token || !token.includes('.')) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const [payloadString, signature] = token.split('.');
      if (!payloadString || !signature) {
        throw new Error('Malformed token');
      }

      // Check expiration from payload
      const payloadJson = JSON.parse(
        atob(payloadString.replace(/-/g, '+').replace(/_/g, '/'))
      );

      if (!payloadJson.expiresAt || Date.now() > payloadJson.expiresAt) {
        throw new Error('Expired session');
      }

      // Session is active and structurally valid
      return NextResponse.next();
    } catch {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
