'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Coupon } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const EMPTY_FORM = {
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '',
  min_order_amount: '0',
  expiry_date: '',
  usage_limit: '',
};

export default function CouponsManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          type: form.type,
          value: Number(form.value),
          min_order_amount: Number(form.min_order_amount) || 0,
          expiry_date: form.expiry_date || null,
          usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
          is_active: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not create coupon.');
        return;
      }
      setCoupons((prev) => [data.coupon, ...prev]);
      setForm(EMPTY_FORM);
      setFormOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(c: Coupon) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)));
  }

  async function remove(c: Coupon) {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' });
    setCoupons((prev) => prev.filter((x) => x.id !== c.id));
  }

  return (
    <div>
      <div className="mb-4">
        {!formOpen ? (
          <button onClick={() => setFormOpen(true)} className="btn-primary !py-2 text-xs">
            + Create Coupon
          </button>
        ) : (
          <form onSubmit={handleCreate} className="grid max-w-2xl gap-4 border border-sandline bg-bone p-5 sm:grid-cols-2">
            <div>
              <label className="label">Code</label>
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input font-mono uppercase" />
            </div>
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="input">
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off (₹)</option>
              </select>
            </div>
            <div>
              <label className="label">Value {form.type === 'percentage' ? '(%)' : '(₹)'}</label>
              <input required type="number" min={1} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Minimum order (₹)</label>
              <input type="number" min={0} value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Expiry date (optional)</label>
              <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Usage limit (optional)</label>
              <input type="number" min={1} value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="input" />
            </div>
            {error && <p className="text-xs font-semibold text-clay sm:col-span-2">{error}</p>}
            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Creating…' : 'Create'}</button>
              <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="overflow-x-auto border border-sandline bg-bone">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sandline text-xs uppercase text-ink/50">
              <th className="p-3">Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Min Order</th>
              <th className="p-3">Usage</th>
              <th className="p-3">Expiry</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-sandline/60">
                <td className="p-3 font-mono font-semibold">{c.code}</td>
                <td className="p-3">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="p-3 font-mono">₹{c.min_order_amount}</td>
                <td className="p-3 font-mono">{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                <td className="p-3 text-ink/60">{c.expiry_date ? formatDate(c.expiry_date) : '—'}</td>
                <td className="p-3">
                  <span className={`border px-2 py-0.5 text-xs font-semibold ${c.is_active ? 'border-okgreen/30 bg-okgreen/10 text-okgreen' : 'border-sandline bg-sand text-ink/60'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-3 text-xs font-semibold uppercase">
                    <button onClick={() => toggleActive(c)} className="text-indigo hover:underline">{c.is_active ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => remove(c)} className="text-clay hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-ink/50">No coupons yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
