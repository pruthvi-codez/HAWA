'use client';

import { useMemo, useState } from 'react';

interface VariantRow {
  id: string;
  product_name: string;
  category_name: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  low_stock_threshold: number;
}

export default function InventoryTable({ initialVariants }: { initialVariants: VariantRow[] }) {
  const [variants, setVariants] = useState(initialVariants);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [lowOnly, setLowOnly] = useState(false);

  const filtered = useMemo(() => {
    return variants.filter((v) => {
      if (lowOnly && v.stock > v.low_stock_threshold) return false;
      if (search && !v.product_name.toLowerCase().includes(search.toLowerCase()) && !v.sku.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [variants, search, lowOnly]);

  async function save(id: string) {
    const draft = drafts[id];
    if (draft === undefined) return;
    const stock = Math.max(0, parseInt(draft, 10) || 0);
    setSavingId(id);
    try {
      await fetch(`/api/admin/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock }),
      });
      setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, stock } : v)));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or SKU…" className="input max-w-xs" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} className="accent-ink" />
          Low stock only
        </label>
      </div>

      <div className="overflow-x-auto border border-sandline bg-bone">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sandline text-xs uppercase text-ink/50">
              <th className="p-3">Product</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Size</th>
              <th className="p-3">Colour</th>
              <th className="p-3">Stock</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const draft = drafts[v.id];
              const isLow = v.stock <= v.low_stock_threshold;
              return (
                <tr key={v.id} className={`border-b border-sandline/60 ${isLow ? 'bg-clay/5' : ''}`}>
                  <td className="p-3 font-semibold">{v.product_name}</td>
                  <td className="p-3 font-mono text-xs text-ink/60">{v.sku}</td>
                  <td className="p-3">{v.size}</td>
                  <td className="p-3">{v.color}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      min={0}
                      value={draft !== undefined ? draft : v.stock}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [v.id]: e.target.value }))}
                      className={`w-20 border px-2 py-1 font-mono text-sm focus:outline-none ${isLow ? 'border-clay text-clay' : 'border-sandline'}`}
                    />
                  </td>
                  <td className="p-3">
                    {draft !== undefined && draft !== String(v.stock) && (
                      <button onClick={() => save(v.id)} disabled={savingId === v.id} className="btn-secondary !px-3 !py-1.5 text-xs">
                        {savingId === v.id ? 'Saving…' : 'Save'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-ink/50">No variants match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
