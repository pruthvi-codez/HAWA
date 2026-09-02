import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/apiAuth';
import { getUserById, updateUserPassword } from '@/lib/models/users';
import { hashPassword, verifyPassword } from '@/lib/password';

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
});

export async function PUT(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const user = getUserById(auth.session.sub);
  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.password_hash))) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  updateUserPassword(user.id, passwordHash);

  return NextResponse.json({ ok: true });
}
