import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/apiAuth';
import { getUserById, setUserStatus } from '@/lib/models/users';
import { logAdminAction } from '@/lib/models/adminLog';

const schema = z.object({ status: z.enum(['active', 'deactivated']) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const user = getUserById(params.id);
  if (!user || user.role !== 'customer') return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });

  setUserStatus(params.id, parsed.data.status);
  logAdminAction({
    adminId: auth.session.sub,
    adminName: auth.session.name,
    action: 'customer.status',
    details: `${user.email} → ${parsed.data.status}`,
  });

  return NextResponse.json({ ok: true });
}
