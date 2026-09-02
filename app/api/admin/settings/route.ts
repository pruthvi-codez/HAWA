import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/apiAuth';
import { setSettings } from '@/lib/models/settings';
import { logAdminAction } from '@/lib/models/adminLog';

const schema = z.object({
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  contact_address: z.string().optional(),
  logo_text: z.string().optional(),
  instagram_url: z.string().optional(),
  twitter_url: z.string().optional(),
  facebook_url: z.string().optional(),

  standard_charge: z.number().min(0).optional(),
  standard_days: z.string().optional(),
  express_charge: z.number().min(0).optional(),
  express_days: z.string().optional(),
  free_shipping_threshold: z.number().min(0).optional(),

  enable_upi: z.boolean().optional(),
  enable_card: z.boolean().optional(),
  enable_netbanking: z.boolean().optional(),
  enable_wallet: z.boolean().optional(),
  enable_cod: z.boolean().optional(),
  cod_limit: z.number().min(0).optional(),
});

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  setSettings(parsed.data);
  logAdminAction({ adminId: auth.session.sub, adminName: auth.session.name, action: 'settings.update' });

  return NextResponse.json({ ok: true });
}
