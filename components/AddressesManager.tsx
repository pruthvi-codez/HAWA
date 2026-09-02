'use client';

import { useEffect, useState } from 'react';
import type { Address } from '@/lib/types';

const EMPTY_FORM = { name: '', phone: '', address_line: '', city: '', state: '', pincode: '', is_default: false };

export default function AddressesManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/addresses');
    const data = await res.json();
    setAddresses(data.addresses || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormOpen(true);
    setError(null);
  }

  function openEdit(a: Address) {
    setForm({ name: a.name, phone: a.phone, address_line: a.address_line, city: a.city, state: a.state, pincode: a.pincode, is_default: a.is_default });
    setEditingId(a.id);
    setFormOpen(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(editingId ? `/api/addresses/${editingId}` : '/api/addresses', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save address.');
        return;
      }
      setFormOpen(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this address?')) return;
    await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
    await load();
  }

  async function setDefault(a: Address) {
    await fetch(`/api/addresses/${a.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_default: true }),
    });
    await load();
  }

  if (loading) return <p className="text-sm text-ink/50">Loading addresses…</p>;

  return (
    <div className="space-y-6">
      {addresses.length === 0 && !formOpen && (
        <p className="border border-dashed border-sandline p-6 text-center text-sm text-ink/50">No saved addresses yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className="border border-sandline p-4 text-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">{a.name}</p>
              {a.is_default && <span className="border border-indigo px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo">Default</span>}
            </div>
            <p className="text-ink/60">{a.phone}</p>
            <p className="text-ink/60">{a.address_line}, {a.city}, {a.state} {a.pincode}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold uppercase">
              <button onClick={() => openEdit(a)} className="text-indigo hover:underline">Edit</button>
              <button onClick={() => handleDelete(a.id)} className="text-clay hover:underline">Delete</button>
              {!a.is_default && (
                <button onClick={() => setDefault(a)} className="text-ink/60 hover:underline">
                  Set as default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!formOpen ? (
        <button onClick={openNew} className="btn-secondary">
          + Add New Address
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4 border border-sandline p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Full name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Phone</label>
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input required value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">City</label>
            <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">State</label>
            <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Pincode</label>
            <input required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="input" />
          </div>
          <label className="flex items-center gap-2 self-end text-sm sm:col-span-1">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="accent-ink" />
            Set as default
          </label>
          {error && <p className="text-xs font-semibold text-clay sm:col-span-2">{error}</p>}
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Saving…' : 'Save Address'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
