import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/apiAuth';
import { addToWishlist, getWishlistProducts, removeFromWishlist } from '@/lib/models/wishlist';

const schema = z.object({ productId: z.string() });

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  return NextResponse.json({ products: getWishlistProducts(auth.session.sub) });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid product.' }, { status: 400 });
  addToWishlist(auth.session.sub, parsed.data.productId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid product.' }, { status: 400 });
  removeFromWishlist(auth.session.sub, parsed.data.productId);
  return NextResponse.json({ ok: true });
}
