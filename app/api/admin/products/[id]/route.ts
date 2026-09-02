import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/apiAuth';
import { deleteProduct, getProductById, updateProduct } from '@/lib/models/products';
import { logAdminAction } from '@/lib/models/adminLog';
import { slugify } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  category_id: z.string().optional(),
  base_price: z.number().positive().optional(),
  discount_price: z.number().positive().nullable().optional(),
  images: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  material: z.string().optional(),
  care_instructions: z.string().optional(),
  sku_prefix: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const product = getProductById(params.id);
  if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const existing = getProductById(params.id);
  if (!existing) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const input = { ...parsed.data } as any;
  if (input.name && input.name !== existing.name) {
    input.slug = slugify(input.name);
  }

  updateProduct(params.id, input);
  logAdminAction({ adminId: auth.session.sub, adminName: auth.session.name, action: 'product.update', details: existing.name });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const existing = getProductById(params.id);
  if (!existing) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

  deleteProduct(params.id);
  logAdminAction({ adminId: auth.session.sub, adminName: auth.session.name, action: 'product.delete', details: existing.name });

  return NextResponse.json({ ok: true });
}
