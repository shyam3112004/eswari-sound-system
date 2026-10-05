import { NextRequest, NextResponse } from 'next/server';
import { verifySession, ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const { valid, session } = verifySession(token);

  if (!valid || !session) {
    return NextResponse.json(
      { authenticated: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.email,
      role: session.role,
      expiresAt: new Date(session.expiresAt).toISOString(),
    },
  });
}
