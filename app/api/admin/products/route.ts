import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/apiAuth';
import { createProduct, getAllProductsForAdmin } from '@/lib/models/products';
import { logAdminAction } from '@/lib/models/adminLog';
import { slugify } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2),
  description: z.string().default(''),
  category_id: z.string(),
  base_price: z.number().positive(),
  discount_price: z.number().positive().nullable().optional(),
  images: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  material: z.string().default(''),
  care_instructions: z.string().default(''),
  sku_prefix: z.string().default(''),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
});

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  return NextResponse.json({ products: getAllProductsForAdmin() });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const product = createProduct({ ...parsed.data, slug: slugify(parsed.data.name) });
  logAdminAction({ adminId: auth.session.sub, adminName: auth.session.name, action: 'product.create', details: product.name });

  return NextResponse.json({ product });
}
