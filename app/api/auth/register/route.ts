import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { createUser, getUserByEmail } from '@/lib/models/users';
import { hashPassword } from '@/lib/password';
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(2, 'Please enter your full name.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().min(10, 'Enter a valid 10-digit phone number.').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, email, phone, password } = parsed.data;

  if (getUserByEmail(email)) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  // Role is intentionally never read from the request body — every self-registration is a customer.
  const passwordHash = await hashPassword(password);
  const user = createUser({ name, email, phone: phone || undefined, passwordHash, role: 'customer' });

  const token = await createSessionToken({ sub: user.id, role: user.role, name: user.name, email: user.email });
  cookies().set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
