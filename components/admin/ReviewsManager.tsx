'use client';

import { useMemo, useState } from 'react';
import type { Review } from '@/lib/types';
import StarRating from '@/components/StarRating';
import { formatDate } from '@/lib/utils';

export default function ReviewsManager({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const filtered = useMemo(() => {
    if (filter === 'pending') return reviews.filter((r) => !r.is_approved);
    if (filter === 'approved') return reviews.filter((r) => r.is_approved);
    return reviews;
  }, [reviews, filter]);

  async function setApproval(id: string, approved: boolean) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved: approved }),
    });
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, is_approved: approved } : r)));
  }

  async function remove(id: string) {
    if (!confirm('Delete this review?')) return;
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(['pending', 'approved', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`border px-3 py-1.5 text-xs font-semibold uppercase ${filter === f ? 'border-ink bg-ink text-bone' : 'border-sandline text-ink/60'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="border border-sandline bg-bone p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{r.product_name}</p>
                <p className="text-xs text-ink/50">by {r.user_name} · {formatDate(r.created_at)}</p>
              </div>
              <StarRating value={r.rating} size={13} />
            </div>
            <p className="mt-2 text-sm text-ink/70">{r.comment}</p>
            <div className="mt-3 flex gap-3 text-xs font-semibold uppercase">
              {!r.is_approved ? (
                <button onClick={() => setApproval(r.id, true)} className="text-okgreen hover:underline">Approve</button>
              ) : (
                <button onClick={() => setApproval(r.id, false)} className="text-ink/60 hover:underline">Unapprove</button>
              )}
              <button onClick={() => remove(r.id)} className="text-clay hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="border border-dashed border-sandline p-6 text-center text-sm text-ink/50">No reviews here.</p>}
      </div>
    </div>
  );
}
