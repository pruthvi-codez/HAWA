'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { formatINR } from '@/lib/utils';

export default function AdminProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="input max-w-xs"
        />
        <Link href="/admin/products/new" className="btn-primary !py-2 text-xs">
          + Add Product
        </Link>
      </div>

      <div className="overflow-x-auto border border-sandline bg-bone">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sandline text-xs uppercase text-ink/50">
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-sandline/60">
                <td className="p-3 font-semibold">{p.name}</td>
                <td className="p-3 text-ink/60">{p.category_name}</td>
                <td className="p-3 font-mono">{formatINR(p.discount_price ?? p.base_price)}</td>
                <td className="p-3 font-mono">{(p as any).total_stock ?? '—'}</td>
                <td className="p-3">
                  <span className={`border px-2 py-0.5 text-xs font-semibold ${p.is_published ? 'border-okgreen/30 bg-okgreen/10 text-okgreen' : 'border-sandline bg-sand text-ink/60'}`}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                  {p.is_featured && <span className="ml-1 border border-indigo/30 bg-indigo/10 px-2 py-0.5 text-xs font-semibold text-indigo">Featured</span>}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-3 text-xs font-semibold uppercase">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-indigo hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(p.id, p.name)} className="text-clay hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-ink/50">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
