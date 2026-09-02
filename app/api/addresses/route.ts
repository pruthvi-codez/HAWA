import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/apiAuth';
import { createAddress, getAddressesForUser } from '@/lib/models/addresses';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  address_line: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4).max(10),
  is_default: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  return NextResponse.json({ addresses: getAddressesForUser(auth.session.sub) });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const address = createAddress({ user_id: auth.session.sub, ...parsed.data, is_default: !!parsed.data.is_default });
  return NextResponse.json({ address });
}
