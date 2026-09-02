'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Price from '@/components/Price';

interface WishlistProduct {
  id: string;
  slug: string;
  name: string;
  images: string[];
  base_price: number;
  discount_price: number | null;
  category_name: string;
}

export default function WishlistGrid() {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/wishlist');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(productId: string) {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
  }

  if (loading) return <p className="text-sm text-ink/50">Loading wishlist…</p>;

  if (products.length === 0) {
    return (
      <div className="border border-dashed border-sandline py-16 text-center">
        <p className="text-sm text-ink/60">Your wishlist is empty.</p>
        <Link href="/shop" className="btn-primary mt-4 inline-flex">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
      {products.map((p) => (
        <div key={p.id} className="group relative">
          <Link href={`/product/${p.slug}`} className="block">
            <div className="relative aspect-[4/5] overflow-hidden bg-sand">
              <Image src={p.images[0] || ''} alt={p.name} fill sizes="33vw" className="object-cover" />
            </div>
            <div className="mt-3">
              <p className="eyebrow">{p.category_name}</p>
              <h3 className="text-sm font-semibold">{p.name}</h3>
              <Price base={p.base_price} discount={p.discount_price} size="sm" />
            </div>
          </Link>
          <button
            onClick={() => remove(p.id)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-bone/90 text-clay hover:bg-bone"
            aria-label="Remove from wishlist"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
