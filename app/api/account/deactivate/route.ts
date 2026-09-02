import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireUser } from '@/lib/apiAuth';
import { setUserStatus } from '@/lib/models/users';
import { SESSION_COOKIE } from '@/lib/auth';

export async function POST() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  setUserStatus(auth.session.sub, 'deactivated');
  cookies().delete(SESSION_COOKIE);

  return NextResponse.json({ ok: true });
}
