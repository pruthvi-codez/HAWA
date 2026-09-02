import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/apiAuth';
import { createReview, userHasReviewed } from '@/lib/models/reviews';
import { getProductById } from '@/lib/models/products';

const schema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const product = getProductById(parsed.data.productId);
  if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

  if (userHasReviewed(parsed.data.productId, auth.session.sub)) {
    return NextResponse.json({ error: "You've already reviewed this product." }, { status: 409 });
  }

  const review = createReview({
    productId: parsed.data.productId,
    userId: auth.session.sub,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });

  return NextResponse.json({ review });
}
