import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/apiAuth';
import { deleteReview, setReviewApproval } from '@/lib/models/reviews';
import { logAdminAction } from '@/lib/models/adminLog';

const schema = z.object({ is_approved: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  setReviewApproval(params.id, parsed.data.is_approved);
  logAdminAction({
    adminId: auth.session.sub,
    adminName: auth.session.name,
    action: 'review.moderate',
    details: `${params.id} → ${parsed.data.is_approved ? 'approved' : 'rejected'}`,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  deleteReview(params.id);
  logAdminAction({ adminId: auth.session.sub, adminName: auth.session.name, action: 'review.delete', details: params.id });

  return NextResponse.json({ ok: true });
}
