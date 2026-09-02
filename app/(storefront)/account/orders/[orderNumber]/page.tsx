import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getOrderByNumber } from '@/lib/models/orders';
import { formatDateTime, formatINR, statusBadgeClasses, ORDER_STATUSES } from '@/lib/utils';

export const metadata = { title: 'Order Details' };

export default async function AccountOrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const session = await getSession();
  const order = getOrderByNumber(params.orderNumber);
  if (!order || order.user_id !== session!.sub) notFound();

  const currentStep = ORDER_STATUSES.indexOf(order.status);
  const trackingSteps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
  const isCancelledOrReturned = order.status === 'Cancelled' || order.status === 'Returned';

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-sandline p-6">
        <div>
          <p className="font-mono text-lg font-semibold">{order.order_number}</p>
          <p className="text-xs text-ink/50">Placed {formatDateTime(order.created_at)}</p>
        </div>
        <span className={`border px-3 py-1.5 text-xs font-semibold ${statusBadgeClasses(order.status)}`}>{order.status}</span>
      </div>

      {!isCancelledOrReturned && (
        <div className="border border-sandline p-6">
          <div className="flex items-center justify-between">
            {trackingSteps.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center text-center">
                <div className={`h-3 w-3 rounded-full ${i <= currentStep ? 'bg-indigo' : 'bg-sandline'}`} />
                <p className={`mt-2 text-[11px] font-semibold uppercase ${i <= currentStep ? 'text-ink' : 'text-ink/30'}`}>{step}</p>
                {i < trackingSteps.length - 1 && <div className={`mt-[-24px] h-px w-full translate-y-[-14px] ${i < currentStep ? 'bg-indigo' : 'bg-sandline'}`} />}
              </div>
            ))}
          </div>
          {order.tracking_number && (
            <div className="mt-6 border-t border-sandline pt-4 text-sm">
              <p><span className="text-ink/50">Courier:</span> {order.courier_name}</p>
              <p><span className="text-ink/50">Tracking number:</span> <span className="font-mono">{order.tracking_number}</span></p>
              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-semibold text-indigo hover:underline">
                  Track shipment →
                </a>
              )}
            </div>
          )}
        </div>
      )}

      <div className="border border-sandline p-6">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide">Items</p>
        <div className="divide-y divide-sandline">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-semibold">{item.product_name}</p>
                <p className="text-xs text-ink/50">{item.size} / {item.color} × {item.quantity}</p>
              </div>
              <p className="font-mono">{formatINR(item.unit_price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-sandline pt-4 text-right font-mono text-sm">
          <p className="text-ink/60">Subtotal: {formatINR(order.subtotal)}</p>
          {order.discount > 0 && <p className="text-okgreen">Discount: −{formatINR(order.discount)}</p>}
          <p className="text-ink/60">Shipping: {order.shipping_charge === 0 ? 'Free' : formatINR(order.shipping_charge)}</p>
          <p className="text-base font-semibold">Total: {formatINR(order.total_amount)}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border border-sandline p-6 text-sm">
          <p className="mb-2 font-semibold uppercase tracking-wide">Shipping Address</p>
          <p className="text-ink/70">{order.shipping_name} · {order.shipping_phone}</p>
          <p className="text-ink/70">{order.shipping_address_line}, {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
        </div>
        <div className="border border-sandline p-6 text-sm">
          <p className="mb-2 font-semibold uppercase tracking-wide">Payment</p>
          <p className="text-ink/70">{order.payment_method} · {order.payment_status}</p>
          {order.coupon_code && <p className="mt-1 text-ink/70">Coupon used: {order.coupon_code}</p>}
        </div>
      </div>

      {order.status === 'Delivered' && (
        <div className="border border-dashed border-sandline p-5 text-sm">
          <p className="mb-1 font-semibold uppercase tracking-wide">Need a return or exchange?</p>
          <p className="text-ink/60">Returns are accepted within 14 days of delivery. Reach out with your order number and we&rsquo;ll take it from there.</p>
          <Link
            href={`/contact?subject=${encodeURIComponent(`Return/Exchange request for ${order.order_number}`)}`}
            className="btn-secondary mt-3 inline-flex !px-4 !py-2 text-xs"
          >
            Request Return / Exchange
          </Link>
        </div>
      )}
    </div>
  );
}
