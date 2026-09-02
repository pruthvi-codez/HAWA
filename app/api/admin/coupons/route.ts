import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/apiAuth';
import { createCoupon, getCouponByCode } from '@/lib/models/coupons';
import { logAdminAction } from '@/lib/models/adminLog';

const schema = z.object({
  code: z.string().min(3),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive(),
  min_order_amount: z.number().min(0).default(0),
  start_date: z.string().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  is_active: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  if (getCouponByCode(parsed.data.code)) {
    return NextResponse.json({ error: 'A coupon with this code already exists.' }, { status: 409 });
  }

  const coupon = createCoupon(parsed.data);
  logAdminAction({ adminId: auth.session.sub, adminName: auth.session.name, action: 'coupon.create', details: coupon.code });

  return NextResponse.json({ coupon });
}
