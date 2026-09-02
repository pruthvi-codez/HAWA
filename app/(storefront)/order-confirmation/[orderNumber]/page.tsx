import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrderByNumber } from '@/lib/models/orders';
import { formatDateTime, formatINR } from '@/lib/utils';

export const metadata = { title: 'Order Confirmed' };

export default function OrderConfirmationPage({ params }: { params: { orderNumber: string } }) {
  const order = getOrderByNumber(params.orderNumber);
  if (!order) notFound();

  return (
    <div className="container-page max-w-3xl py-16">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-okgreen/10 text-okgreen">
          <CheckIcon />
        </div>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight">Order Confirmed</h1>
        <p className="mt-2 text-sm text-ink/60">
          Thank you — your order <span className="font-mono font-semibold text-ink">{order.order_number}</span> has been placed.
        </p>
      </div>

      <div className="mt-10 border border-sandline p-6">
        <div className="grid grid-cols-2 gap-4 border-b border-sandline pb-4 text-sm sm:grid-cols-4">
          <div>
            <p className="eyebrow">Order Date</p>
            <p className="mt-1">{formatDateTime(order.created_at)}</p>
          </div>
          <div>
            <p className="eyebrow">Payment</p>
            <p className="mt-1">{order.payment_method} · {order.payment_status}</p>
          </div>
          <div>
            <p className="eyebrow">Status</p>
            <p className="mt-1">{order.status}</p>
          </div>
          <div>
            <p className="eyebrow">Total</p>
            <p className="mt-1 font-mono font-semibold">{formatINR(order.total_amount)}</p>
          </div>
        </div>

        <div className="divide-y divide-sandline">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-semibold">{item.product_name}</p>
                <p className="text-xs text-ink/50">
                  {item.size} / {item.color} × {item.quantity}
                </p>
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

        <div className="mt-6 border-t border-sandline pt-4 text-sm text-ink/70">
          <p className="eyebrow mb-1">Shipping to</p>
          <p>{order.shipping_name} · {order.shipping_phone}</p>
          <p>{order.shipping_address_line}, {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
        </div>
      </div>

      <div className="mt-8 border border-dashed border-sandline p-5 text-sm text-ink/70">
        <p className="mb-1 font-semibold uppercase tracking-wide text-ink">What happens next</p>
        <p>We&rsquo;ll send updates to your email/phone as your order is confirmed, packed, and shipped. Standard orders are packed within 24 hours.</p>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/shop" className="btn-secondary">Continue Shopping</Link>
        <Link href="/account/orders" className="btn-primary">View Order History</Link>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
