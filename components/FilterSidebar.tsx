'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const ALL_COLORS = ['Black', 'White', 'Sand', 'Indigo Blue', 'Olive', 'Rust', 'Sage', 'Charcoal', 'Washed Grey', 'Light Wash'];

export default function FilterSidebar({ categories }: { categories?: { name: string; slug: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '');

  const activeSizes = searchParams.getAll('size');
  const activeColors = searchParams.getAll('color');

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleValue(key: 'size' | 'color', value: string) {
    updateParams((params) => {
      const values = params.getAll(key);
      params.delete(key);
      if (values.includes(value)) {
        values.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        [...values, value].forEach((v) => params.append(key, v));
      }
    });
  }

  function applyPrice() {
    updateParams((params) => {
      if (minPrice) params.set('min', minPrice);
      else params.delete('min');
      if (maxPrice) params.set('max', maxPrice);
      else params.delete('max');
    });
  }

  function clearAll() {
    setMinPrice('');
    setMaxPrice('');
    router.push(pathname);
  }

  return (
    <aside className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="eyebrow">Filter</h2>
        <button onClick={clearAll} className="text-xs font-semibold uppercase text-indigo hover:underline">
          Clear all
        </button>
      </div>

      {categories && categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Category</h3>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <a href={`/category/${c.slug}`} className="text-ink/70 hover:text-indigo">
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Size</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleValue('size', s)}
              className={`h-9 min-w-9 border px-2 text-xs font-semibold ${
                activeSizes.includes(s) ? 'border-ink bg-ink text-bone' : 'border-sandline text-ink hover:border-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Color</h3>
        <div className="flex flex-col gap-2 text-sm">
          {ALL_COLORS.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={activeColors.includes(c)}
                onChange={() => toggleValue('color', c)}
                className="h-4 w-4 accent-ink"
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide">Price (₹)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input py-1.5 text-xs"
          />
          <span className="text-ink/40">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input py-1.5 text-xs"
          />
        </div>
        <button onClick={applyPrice} className="btn-secondary mt-3 w-full !py-2 text-xs">
          Apply
        </button>
      </div>
    </aside>
  );
}
