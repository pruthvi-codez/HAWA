'use client';

import { useState } from 'react';

interface SettingsValues {
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  logo_text: string;
  instagram_url: string;
  twitter_url: string;
  facebook_url: string;
  standard_charge: number;
  standard_days: string;
  express_charge: number;
  express_days: string;
  free_shipping_threshold: number;
  enable_upi: boolean;
  enable_card: boolean;
  enable_netbanking: boolean;
  enable_wallet: boolean;
  enable_cod: boolean;
  cod_limit: number;
}

export default function SettingsEditor({ initial }: { initial: SettingsValues }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="border border-sandline bg-bone p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Store Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Logo text</label>
            <input value={values.logo_text} onChange={(e) => set('logo_text', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Contact email</label>
            <input value={values.contact_email} onChange={(e) => set('contact_email', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Contact phone</label>
            <input value={values.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Studio / warehouse address</label>
            <input value={values.contact_address} onChange={(e) => set('contact_address', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Instagram URL</label>
            <input value={values.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Facebook URL</label>
            <input value={values.facebook_url} onChange={(e) => set('facebook_url', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Twitter / X URL</label>
            <input value={values.twitter_url} onChange={(e) => set('twitter_url', e.target.value)} className="input" />
          </div>
        </div>
      </div>

      <div className="border border-sandline bg-bone p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Shipping</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Standard charge (₹)</label>
            <input type="number" min={0} value={values.standard_charge} onChange={(e) => set('standard_charge', Number(e.target.value))} className="input" />
          </div>
          <div>
            <label className="label">Standard delivery time</label>
            <input value={values.standard_days} onChange={(e) => set('standard_days', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Express charge (₹)</label>
            <input type="number" min={0} value={values.express_charge} onChange={(e) => set('express_charge', Number(e.target.value))} className="input" />
          </div>
          <div>
            <label className="label">Express delivery time</label>
            <input value={values.express_days} onChange={(e) => set('express_days', e.target.value)} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Free shipping threshold (₹)</label>
            <input
              type="number"
              min={0}
              value={values.free_shipping_threshold}
              onChange={(e) => set('free_shipping_threshold', Number(e.target.value))}
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="border border-sandline bg-bone p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Payment Methods</h2>
        <p className="mb-4 text-xs text-ink/50">
          These toggles control what shows at checkout. No live payment gateway is connected in this project — see the README for
          notes on integrating Razorpay/Stripe.
        </p>
        <div className="space-y-2 text-sm">
          <ToggleRow label="UPI" checked={values.enable_upi} onChange={(v) => set('enable_upi', v)} />
          <ToggleRow label="Credit / Debit Card" checked={values.enable_card} onChange={(v) => set('enable_card', v)} />
          <ToggleRow label="Net Banking" checked={values.enable_netbanking} onChange={(v) => set('enable_netbanking', v)} />
          <ToggleRow label="Wallets" checked={values.enable_wallet} onChange={(v) => set('enable_wallet', v)} />
          <ToggleRow label="Cash on Delivery" checked={values.enable_cod} onChange={(v) => set('enable_cod', v)} />
        </div>
        <div className="mt-4">
          <label className="label">COD limit (₹)</label>
          <input type="number" min={0} value={values.cod_limit} onChange={(e) => set('cod_limit', Number(e.target.value))} className="input max-w-xs" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && <span className="text-xs font-semibold text-okgreen">Saved.</span>}
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between border border-sandline px-3 py-2.5">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-ink" />
    </label>
  );
}
