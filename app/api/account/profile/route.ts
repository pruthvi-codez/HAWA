import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { requireUser } from '@/lib/apiAuth';
import { getUserByEmail, updateUserProfile } from '@/lib/models/users';
import { createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10).optional().or(z.literal('')),
  email: z.string().email(),
});

export async function PUT(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const existing = getUserByEmail(parsed.data.email);
  if (existing && existing.id !== auth.session.sub) {
    return NextResponse.json({ error: 'That email is already in use by another account.' }, { status: 409 });
  }

  updateUserProfile(auth.session.sub, parsed.data);

  // Refresh the session cookie so the new name/email show up immediately.
  const token = await createSessionToken({
    sub: auth.session.sub,
    role: auth.session.role,
    name: parsed.data.name,
    email: parsed.data.email,
  });
  cookies().set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);

  return NextResponse.json({ ok: true });
}
