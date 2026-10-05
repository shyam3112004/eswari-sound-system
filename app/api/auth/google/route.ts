import { NextRequest, NextResponse } from 'next/server';
import {
  signUserSession,
  USER_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  UserSession,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential, email, name, picture } = body;

    let userEmail = '';
    let userName = '';
    let userPicture = '';
    let userId = '';

    // 1. If Google Identity credential (JWT) is provided
    if (credential) {
      try {
        // Decode Google JWT payload
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64url').toString('utf-8')
          );

          userEmail = payload.email || '';
          userName = payload.name || payload.given_name || 'Event Organizer';
          userPicture = payload.picture || '';
          userId = payload.sub || `google_${Date.now()}`;
        }
      } catch (err) {
        console.warn('Google credential decode fallback:', err);
      }
    }

    // 2. Fallback to provided fields if credential parsing was direct or demo
    if (!userEmail && email) {
      userEmail = email;
      userName = name || 'Customer';
      userPicture = picture || '';
      userId = `google_${Date.now()}`;
    }

    if (!userEmail || !userEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid Google email is required' },
        { status: 400 }
      );
    }

    const cleanEmail = userEmail.toLowerCase().trim();
    const cleanName = userName.trim();
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || 'admin@eswarisound.com').toLowerCase().trim();
    const isAdmin = cleanEmail === configuredAdminEmail;

    const sessionPayload: Omit<UserSession, 'expiresAt'> = {
      id: userId || `usr_${Date.now()}`,
      email: cleanEmail,
      name: cleanName,
      picture: userPicture,
      role: isAdmin ? 'admin' : 'customer',
    };

    const token = signUserSession(sessionPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Google authentication successful',
      user: {
        ...sessionPayload,
        isAdmin,
      },
    });

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (error: any) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Google authentication failed' },
      { status: 500 }
    );
  }

}
