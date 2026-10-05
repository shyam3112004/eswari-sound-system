import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'eswari_admin_token';
export const USER_COOKIE_NAME = 'eswari_user_token';
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface AdminSession {
  email: string;
  role: 'admin';
  expiresAt: number;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'admin' | 'customer';
  expiresAt: number;
}

function getSecretKey(): string {
  return process.env.NEXTAUTH_SECRET || 'dev-secret-fallback-key-32chars!';
}

/**
 * Creates a tamper-proof signed session token (base64Payload.signature)
 */
export function signSession(payload: Omit<AdminSession, 'expiresAt'>): string {
  const session: AdminSession = {
    ...payload,
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  };

  const payloadString = Buffer.from(JSON.stringify(session)).toString('base64url');
  const hmac = crypto.createHmac('sha256', getSecretKey());
  hmac.update(payloadString);
  const signature = hmac.digest('base64url');

  return `${payloadString}.${signature}`;
}

/**
 * Verifies the token signature and expiration
 */
export function verifySession(token: string | undefined | null): {
  valid: boolean;
  session?: AdminSession;
} {
  if (!token || !token.includes('.')) {
    return { valid: false };
  }

  const [payloadString, signature] = token.split('.');
  if (!payloadString || !signature) {
    return { valid: false };
  }

  const hmac = crypto.createHmac('sha256', getSecretKey());
  hmac.update(payloadString);
  const expectedSignature = hmac.digest('base64url');

  // Constant-time comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return { valid: false };
  }

  try {
    const session = JSON.parse(
      Buffer.from(payloadString, 'base64url').toString('utf-8')
    ) as AdminSession;

    if (Date.now() > session.expiresAt) {
      return { valid: false };
    }

    return { valid: true, session };
  } catch {
    return { valid: false };
  }
}

/**
 * Validates admin credentials against environment variables
 */
export function checkAdminCredentials(email: string, pass: string): boolean {
  const configuredEmail = process.env.ADMIN_EMAIL || 'admin@eswarisound.com';
  const configuredPassword = process.env.ADMIN_PASSWORD || 'eswari-live-2026';

  const isEmailMatch = email.toLowerCase().trim() === configuredEmail.toLowerCase().trim();
  const isPassMatch = pass.trim() === configuredPassword.trim();

  return isEmailMatch && isPassMatch;
}

/**
 * Creates a signed UserSession token for customer Google login
 */
export function signUserSession(payload: Omit<UserSession, 'expiresAt'>): string {
  const session: UserSession = {
    ...payload,
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  };

  const payloadString = Buffer.from(JSON.stringify(session)).toString('base64url');
  const hmac = crypto.createHmac('sha256', getSecretKey());
  hmac.update(payloadString);
  const signature = hmac.digest('base64url');

  return `${payloadString}.${signature}`;
}

/**
 * Verifies a UserSession token
 */
export function verifyUserSession(token: string | undefined | null): {
  valid: boolean;
  session?: UserSession;
} {
  if (!token || !token.includes('.')) {
    return { valid: false };
  }

  const [payloadString, signature] = token.split('.');
  if (!payloadString || !signature) {
    return { valid: false };
  }

  const hmac = crypto.createHmac('sha256', getSecretKey());
  hmac.update(payloadString);
  const expectedSignature = hmac.digest('base64url');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return { valid: false };
  }

  try {
    const session = JSON.parse(
      Buffer.from(payloadString, 'base64url').toString('utf-8')
    ) as UserSession;

    if (Date.now() > session.expiresAt) {
      return { valid: false };
    }

    return { valid: true, session };
  } catch {
    return { valid: false };
  }
}

