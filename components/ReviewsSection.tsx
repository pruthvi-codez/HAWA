'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StarRating from '@/components/StarRating';
import { useClientSession } from '@/context/SessionContext';
import type { Review } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function ReviewsSection({
  productId,
  reviews,
  ratingAvg,
  ratingCount,
}: {
  productId: string;
  reviews: Review[];
  ratingAvg: number;
  ratingCount: number;
}) {
  const session = useClientSession();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      router.push(`/login?next=/product`);
      return;
    }
    setSubmitting(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not submit review.');
        setStatus('error');
      } else {
        setStatus('done');
        setComment('');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="reviews" className="grid gap-10 lg:grid-cols-[280px_1fr]">
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-4xl font-black">{ratingAvg.toFixed(1)}</span>
          <div>
            <StarRating value={ratingAvg} size={16} />
            <p className="mt-1 text-xs text-ink/50">{ratingCount} review{ratingCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <form onSubmit={submitReview} className="mt-8 space-y-3 border-t border-sandline pt-6">
          <p className="text-sm font-semibold uppercase tracking-wide">Write a review</p>
          <StarRating value={rating} interactive size={22} onChange={setRating} />
          <textarea
            required
            minLength={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think of the fit, fabric, and quality?"
            rows={4}
            className="input"
          />
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {session ? (submitting ? 'Submitting…' : 'Submit Review') : 'Log in to review'}
          </button>
          {status === 'done' && <p className="text-xs font-semibold text-okgreen">Thanks — your review will appear once approved.</p>}
          {status === 'error' && <p className="text-xs font-semibold text-clay">{errorMsg}</p>}
        </form>
      </div>

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-sm text-ink/50">No reviews yet — be the first to write one.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="border-b border-sandline pb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{r.user_name}</p>
                <span className="text-xs text-ink/40">{formatDate(r.created_at)}</span>
              </div>
              <StarRating value={r.rating} size={13} />
              <p className="mt-2 text-sm text-ink/70">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
