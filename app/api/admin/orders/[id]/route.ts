import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/apiAuth';
import { getOrderById, updateOrderStatus, updateOrderTracking, updatePaymentStatus } from '@/lib/models/orders';
import { logAdminAction } from '@/lib/models/adminLog';
import { ORDER_STATUSES } from '@/lib/utils';

const schema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  payment_status: z.enum(['Pending', 'Paid', 'Failed', 'Refunded']).optional(),
  courier_name: z.string().optional(),
  tracking_number: z.string().optional(),
  tracking_url: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const order = getOrderById(params.id);
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { status, payment_status, ...tracking } = parsed.data;

  if (status) {
    updateOrderStatus(params.id, status);
    logAdminAction({ adminId: auth.session.sub, adminName: auth.session.name, action: 'order.status', details: `${order.order_number} → ${status}` });
  }
  if (payment_status) {
    updatePaymentStatus(params.id, payment_status);
    logAdminAction({ adminId: auth.session.sub, adminName: auth.session.name, action: 'order.payment_status', details: `${order.order_number} → ${payment_status}` });
  }
  if (tracking.courier_name || tracking.tracking_number || tracking.tracking_url) {
    updateOrderTracking(params.id, tracking);
    logAdminAction({ adminId: auth.session.sub, adminName: auth.session.name, action: 'order.tracking', details: order.order_number });
  }

  return NextResponse.json({ order: getOrderById(params.id) });
}
