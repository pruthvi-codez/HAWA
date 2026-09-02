import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'hawa_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type SessionRole = 'customer' | 'admin';

export interface SessionPayload {
  sub: string; // user id
  role: SessionRole;
  name: string;
  email: string;
}

function getSecretKey() {
  const secret = process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me';
  return new TextEncoder().encode(secret);
}

/** Sign a session JWT. Safe to call from Node route handlers/server actions. */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

/** Verify a session JWT. Works in both Node and Edge (middleware) runtimes. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || !payload.role || !payload.email) return null;
    return {
      sub: payload.sub as string,
      role: payload.role as SessionRole,
      name: (payload.name as string) || '',
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
};

/** Read + verify the session cookie from within a Server Component, Route Handler, or Server Action. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
