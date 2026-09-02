import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/apiAuth';
import { getVariantById, setVariantStock } from '@/lib/models/products';
import { logAdminAction } from '@/lib/models/adminLog';

const schema = z.object({ stock: z.number().int().min(0) });

export async function PUT(req: NextRequest, { params }: { params: { variantId: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const variant = getVariantById(params.variantId);
  if (!variant) return NextResponse.json({ error: 'Variant not found.' }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid stock quantity.' }, { status: 400 });

  setVariantStock(params.variantId, parsed.data.stock);
  logAdminAction({
    adminId: auth.session.sub,
    adminName: auth.session.name,
    action: 'inventory.update',
    details: `${variant.sku} → ${parsed.data.stock}`,
  });

  return NextResponse.json({ ok: true });
}
