'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/lib/types';
import { formatDateTime, formatINR, ORDER_STATUSES, statusBadgeClasses } from '@/lib/utils';

export default function AdminOrderDetail({ order: initialOrder }: { order: Order }) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [courierName, setCourierName] = useState(order.courier_name || '');
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveAll() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          payment_status: paymentStatus,
          courier_name: courierName,
          tracking_number: trackingNumber,
          tracking_url: trackingUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data.order);
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-semibold">{order.order_number}</h1>
          <p className="text-xs text-ink/50">Placed {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`border px-3 py-1.5 text-xs font-semibold ${statusBadgeClasses(order.status)}`}>{order.status}</span>
          <button onClick={() => window.print()} className="btn-secondary !px-4 !py-2 text-xs">
            Print Invoice
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border border-sandline bg-bone p-5 text-sm">
          <p className="mb-2 font-semibold uppercase tracking-wide">Shipping Address</p>
          <p>{order.shipping_name} · {order.shipping_phone}</p>
          <p className="text-ink/60">{order.shipping_address_line}, {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
          <p className="mt-2 text-ink/60">Method: {order.shipping_method}</p>
        </div>
        <div className="border border-sandline bg-bone p-5 text-sm">
          <p className="mb-2 font-semibold uppercase tracking-wide">Payment</p>
          <p>{order.payment_method}</p>
          {order.coupon_code && <p className="mt-1 text-ink/60">Coupon: {order.coupon_code}</p>}
        </div>
      </div>

      <div className="border border-sandline bg-bone p-5">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide">Items</p>
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

      <div className="grid gap-6 border border-sandline bg-bone p-5 sm:grid-cols-2">
        <div>
          <label className="label">Order status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="input">
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Payment status</label>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)} className="input">
            {['Pending', 'Paid', 'Failed', 'Refunded'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Courier name</label>
          <input value={courierName} onChange={(e) => setCourierName(e.target.value)} className="input" placeholder="e.g. Delhivery" />
        </div>
        <div>
          <label className="label">Tracking number</label>
          <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Tracking URL</label>
          <input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} className="input" placeholder="https://..." />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <button onClick={saveAll} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Updates'}
          </button>
          {saved && <span className="text-xs font-semibold text-okgreen">Saved.</span>}
        </div>
      </div>
    </div>
  );
}
