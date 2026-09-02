'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDate, formatINR } from '@/lib/utils';

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'active' | 'deactivated';
  created_at: string;
  order_count: number;
  total_spent: number;
}

export default function AdminCustomersTable({ initialCustomers }: { initialCustomers: CustomerRow[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
      ),
    [customers, search]
  );

  async function toggleStatus(c: CustomerRow) {
    const nextStatus = c.status === 'active' ? 'deactivated' : 'active';
    await fetch(`/api/admin/customers/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    setCustomers((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: nextStatus } : x)));
  }

  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…" className="input mb-4 max-w-xs" />

      <div className="overflow-x-auto border border-sandline bg-bone">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sandline text-xs uppercase text-ink/50">
              <th className="p-3">Name</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Spent</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-sandline/60">
                <td className="p-3">
                  <Link href={`/admin/customers/${c.id}`} className="font-semibold hover:text-indigo">{c.name}</Link>
                  <p className="text-xs text-ink/50">{c.email}</p>
                </td>
                <td className="p-3 text-ink/60">{formatDate(c.created_at)}</td>
                <td className="p-3 font-mono">{c.order_count}</td>
                <td className="p-3 font-mono">{formatINR(c.total_spent)}</td>
                <td className="p-3">
                  <span className={`border px-2 py-0.5 text-xs font-semibold ${c.status === 'active' ? 'border-okgreen/30 bg-okgreen/10 text-okgreen' : 'border-clay/30 bg-clay/10 text-clay'}`}>
                    {c.status === 'active' ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => toggleStatus(c)} className="text-xs font-semibold uppercase text-indigo hover:underline">
                    {c.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-ink/50">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
