import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/apiAuth';
import { setSettings } from '@/lib/models/settings';
import { logAdminAction } from '@/lib/models/adminLog';

const schema = z.object({
  store_name: z.string().min(1).optional(),
  store_tagline: z.string().optional(),
  hero_headline: z.string().optional(),
  hero_subtext: z.string().optional(),
  hero_cta_label: z.string().optional(),
  about_content: z.string().optional(),
  contact_content: z.string().optional(),
  shipping_policy: z.string().optional(),
  returns_policy: z.string().optional(),
  privacy_policy: z.string().optional(),
  terms_content: z.string().optional(),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  testimonials: z.array(z.object({ name: z.string(), quote: z.string(), rating: z.number().min(1).max(5) })).optional(),
});

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  setSettings(parsed.data);
  logAdminAction({ adminId: auth.session.sub, adminName: auth.session.name, action: 'content.update' });

  return NextResponse.json({ ok: true });
}
