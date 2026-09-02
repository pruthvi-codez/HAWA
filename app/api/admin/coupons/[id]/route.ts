import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/apiAuth';
import { deleteCoupon, getCouponById, updateCoupon } from '@/lib/models/coupons';
import { logAdminAction } from '@/lib/models/adminLog';

const schema = z.object({
  is_active: z.boolean().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  value: z.number().positive().optional(),
  min_order_amount: z.number().min(0).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const existing = getCouponById(params.id);
  if (!existing) return NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  updateCoupon(params.id, parsed.data);
  logAdminAction({ adminId: auth.session.sub, adminName: auth.session.name, action: 'coupon.update', details: existing.code });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const existing = getCouponById(params.id);
  if (!existing) return NextResponse.json({ error: 'Coupon not found.' }, { status: 404 });

  deleteCoupon(params.id);
  logAdminAction({ adminId: auth.session.sub, adminName: auth.session.name, action: 'coupon.delete', details: existing.code });

  return NextResponse.json({ ok: true });
}
