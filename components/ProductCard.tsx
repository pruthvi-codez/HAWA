'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import Price from '@/components/Price';
import StarRating from '@/components/StarRating';
import { useCart } from '@/context/CartContext';
import { useClientSession } from '@/context/SessionContext';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product, initialWishlisted = false }: { product: Product; initialWishlisted?: boolean }) {
  const { addLine } = useCart();
  const session = useClientSession();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [wishBusy, setWishBusy] = useState(false);
  const [added, setAdded] = useState(false);

  const image = product.images?.[0] || 'https://picsum.photos/seed/placeholder/900/1125';
  const hoverImage = product.images?.[1];

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push('/login?next=/shop');
      return;
    }
    setWishBusy(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: wishlisted ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) setWishlisted(!wishlisted);
    } finally {
      setWishBusy(false);
    }
  }

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const variants = product.variants || [];
    const firstAvailable = variants.find((v) => v.stock > 0);
    if (!firstAvailable) return;
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      size: firstAvailable.size,
      color: firstAvailable.color,
      price: product.discount_price ?? product.base_price,
      quantity: 1,
      maxStock: firstAvailable.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const outOfStock = product.total_stock !== undefined && product.total_stock <= 0;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition-opacity duration-300 ${hoverImage ? 'group-hover:opacity-0' : ''}`}
        />
        {hoverImage && (
          <Image
            src={hoverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        {product.discount_price && (
          <span className="absolute left-2 top-2 bg-clay px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-bone">
            Sale
          </span>
        )}

        <button
          onClick={toggleWishlist}
          disabled={wishBusy}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-bone/90 text-ink transition-colors hover:bg-bone"
        >
          <HeartIcon filled={wishlisted} />
        </button>

        <div className="absolute inset-x-2 bottom-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {outOfStock ? (
            <span className="block bg-ink/80 py-2 text-center font-mono text-[11px] uppercase tracking-widest2 text-bone">
              Out of stock
            </span>
          ) : (
            <button
              onClick={quickAdd}
              className="block w-full bg-ink py-2 text-center font-mono text-[11px] uppercase tracking-widest2 text-bone hover:bg-indigo"
            >
              {added ? 'Added ✓' : 'Add to cart'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p className="eyebrow">{product.category_name}</p>
        <h3 className="text-sm font-semibold text-ink">{product.name}</h3>
        <div className="flex items-center justify-between">
          <Price base={product.base_price} discount={product.discount_price} size="sm" />
          {product.rating_count > 0 && <StarRating value={product.rating_avg} count={product.rating_count} size={11} />}
        </div>
      </div>
    </Link>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#B5533C' : 'none'} stroke={filled ? '#B5533C' : '#1C1B1A'} strokeWidth="1.6">
      <path
        d="M12 20.5S3.5 15.4 3.5 9.4A4.9 4.9 0 0 1 12 6.2a4.9 4.9 0 0 1 8.5 3.2c0 6-8.5 11.1-8.5 11.1Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
