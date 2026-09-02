import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { createOrder } from '@/lib/models/orders';
import { getSettings } from '@/lib/models/settings';
import { SHIPPING_SETTINGS_DEFAULTS, PAYMENT_SETTINGS_DEFAULTS } from '@/lib/settings-defaults';
import { db } from '@/db';

const schema = z.object({
  guestEmail: z.string().email().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        size: z.string(),
        color: z.string(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1),
  couponCode: z.string().optional().nullable(),
  shipping: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    addressLine: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4).max(10),
  }),
  shippingMethod: z.enum(['Standard', 'Express']),
  paymentMethod: z.enum(['UPI', 'Card', 'NetBanking', 'Wallet', 'COD']),
  saveAddress: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const data = parsed.data;

  if (!session && !data.guestEmail) {
    return NextResponse.json({ error: 'Please provide an email address for order updates.' }, { status: 400 });
  }

  const paymentSettings = getSettings(PAYMENT_SETTINGS_DEFAULTS);
  if (data.paymentMethod === 'COD' && !paymentSettings.enable_cod) {
    return NextResponse.json({ error: 'Cash on Delivery is currently unavailable.' }, { status: 400 });
  }

  const shippingSettings = getSettings(SHIPPING_SETTINGS_DEFAULTS);
  const shippingCharge = data.shippingMethod === 'Express' ? shippingSettings.express_charge : 0; // standard charge is resolved below once we know the real subtotal

  const result = createOrder({
    userId: session?.sub || null,
    guestEmail: session ? null : data.guestEmail || null,
    items: data.items,
    couponCode: data.couponCode || undefined,
    shipping: {
      name: data.shipping.name,
      phone: data.shipping.phone,
      addressLine: data.shipping.addressLine,
      city: data.shipping.city,
      state: data.shipping.state,
      pincode: data.shipping.pincode,
    },
    shippingMethod: data.shippingMethod,
    shippingCharge,
    paymentMethod: data.paymentMethod,
  });

  if (result.error || !result.order) {
    return NextResponse.json({ error: result.error || 'Could not place order.' }, { status: 400 });
  }

  // Apply the "free over threshold" rule and standard shipping charge now that
  // we know the real subtotal, then persist the corrected total.
  if (data.shippingMethod === 'Standard') {
    const freeThreshold = shippingSettings.free_shipping_threshold;
    const charge = result.order.subtotal - result.order.discount >= freeThreshold ? 0 : shippingSettings.standard_charge;
    if (charge !== result.order.shipping_charge) {
      const newTotal = result.order.subtotal - result.order.discount + charge;
      db.prepare('UPDATE orders SET shipping_charge = ?, total_amount = ? WHERE id = ?').run(charge, newTotal, result.order.id);
      result.order.shipping_charge = charge;
      result.order.total_amount = newTotal;
    }
  }

  return NextResponse.json({ order: result.order });
}
