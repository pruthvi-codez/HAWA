import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/apiAuth';
import { deleteAddress, getAddressById, updateAddress } from '@/lib/models/addresses';

const schema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  address_line: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincode: z.string().min(4).max(10).optional(),
  is_default: z.boolean().optional(),
});

function assertOwnership(id: string, userId: string) {
  const address = getAddressById(id);
  if (!address || address.user_id !== userId) return null;
  return address;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  if (!assertOwnership(params.id, auth.session.sub)) {
    return NextResponse.json({ error: 'Address not found.' }, { status: 404 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  updateAddress(params.id, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;
  if (!assertOwnership(params.id, auth.session.sub)) {
    return NextResponse.json({ error: 'Address not found.' }, { status: 404 });
  }
  deleteAddress(params.id);
  return NextResponse.json({ ok: true });
}
