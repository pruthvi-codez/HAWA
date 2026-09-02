import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateCoupon } from '@/lib/models/coupons';

const schema = z.object({ code: z.string().min(1), subtotal: z.number().min(0) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ valid: false, message: 'Enter a coupon code.' }, { status: 400 });

  const result = validateCoupon(parsed.data.code, parsed.data.subtotal);
  return NextResponse.json(result);
}
