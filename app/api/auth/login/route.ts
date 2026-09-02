import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies, headers } from 'next/headers';
import { getUserByEmail, touchLastLogin } from '@/lib/models/users';
import { verifyPassword } from '@/lib/password';
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
import { isRateLimited, recordFailedAttempt, clearAttempts } from '@/lib/rateLimit';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const ip = headers().get('x-forwarded-for') || 'local';
  const rateLimitKey = `${ip}:${email.toLowerCase()}`;
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json({ error: 'Too many login attempts. Please try again in a few minutes.' }, { status: 429 });
  }

  const user = getUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    recordFailedAttempt(rateLimitKey);
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  }

  if (user.status === 'deactivated') {
    return NextResponse.json({ error: 'This account has been deactivated. Contact support for help.' }, { status: 403 });
  }

  clearAttempts(rateLimitKey);
  touchLastLogin(user.id);

  const token = await createSessionToken({ sub: user.id, role: user.role, name: user.name, email: user.email });
  cookies().set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
