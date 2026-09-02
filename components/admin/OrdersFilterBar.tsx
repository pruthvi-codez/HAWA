'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ORDER_STATUSES } from '@/lib/utils';

export default function OrdersFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  function updateParams(mutate: (p: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParams((p) => (search ? p.set('search', search) : p.delete('search')));
        }}
        className="flex gap-2"
      >
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order #, name, phone…" className="input max-w-xs" />
        <button type="submit" className="btn-secondary !px-4 text-xs">Search</button>
      </form>

      <select
        value={searchParams.get('status') || ''}
        onChange={(e) => updateParams((p) => (e.target.value ? p.set('status', e.target.value) : p.delete('status')))}
        className="input max-w-[180px]"
      >
        <option value="">All statuses</option>
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
