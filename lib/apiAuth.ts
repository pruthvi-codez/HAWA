import { NextResponse } from 'next/server';
import { getSession, SessionPayload } from '@/lib/auth';

export async function requireUser(): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: 'Please log in to continue.' }, { status: 401 }) };
  }
  return { session };
}

export async function requireAdmin(): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Admin access required.' }, { status: 403 }) };
  }
  return { session };
}
