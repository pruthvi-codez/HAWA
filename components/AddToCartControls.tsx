'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import type { Product, ProductVariant } from '@/lib/types';
import SizeChartModal from '@/components/SizeChartModal';

export default function AddToCartControls({ product }: { product: Product }) {
  const { addLine } = useCart();
  const router = useRouter();
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [color, setColor] = useState<string | null>(product.colors.length === 1 ? product.colors[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const variants = product.variants || [];

  const variant: ProductVariant | undefined = useMemo(() => {
    if (!size || !color) return undefined;
    return variants.find((v) => v.size === size && v.color === color);
  }, [size, color, variants]);

  const stockForSizeColor = (s: string, c: string) => variants.find((v) => v.size === s && v.color === c)?.stock ?? 0;

  const price = product.discount_price ?? product.base_price;
  const image = product.images[0] || '';

  function requireSelection(): boolean {
    if (!size || !color) {
      setError('Please select a size and colour.');
      return false;
    }
    if (!variant || variant.stock <= 0) {
      setError('That combination is out of stock.');
      return false;
    }
    setError(null);
    return true;
  }

  function handleAddToCart() {
    if (!requireSelection() || !variant) return;
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      size: size!,
      color: color!,
      price,
      quantity,
      maxStock: variant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    if (!requireSelection() || !variant) return;
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      size: size!,
      color: color!,
      price,
      quantity,
      maxStock: variant.stock,
    });
    router.push('/checkout');
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="label mb-0">Size {size && <span className="text-ink/40">— {size}</span>}</span>
          <SizeChartModal />
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((s) => {
            const anyStock = product.colors.some((c) => stockForSizeColor(s, c) > 0);
            return (
              <button
                key={s}
                onClick={() => {
                  setSize(s);
                  setError(null);
                }}
                disabled={!anyStock}
                className={`h-10 min-w-10 border px-3 text-sm font-semibold transition-colors ${
                  size === s ? 'border-ink bg-ink text-bone' : 'border-sandline text-ink hover:border-ink'
                } ${!anyStock ? 'cursor-not-allowed opacity-30 line-through' : ''}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className="label">Colour {color && <span className="text-ink/40 normal-case">— {color}</span>}</span>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setError(null);
              }}
              className={`border px-3 py-2 text-xs font-semibold transition-colors ${
                color === c ? 'border-ink bg-ink text-bone' : 'border-sandline text-ink hover:border-ink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        {variant ? (
          variant.stock > 0 ? (
            <p className="text-xs font-semibold text-okgreen">
              {variant.stock <= variant.low_stock_threshold ? `Only ${variant.stock} left in stock` : 'In stock'}
            </p>
          ) : (
            <p className="text-xs font-semibold text-clay">Out of stock in this combination</p>
          )
        ) : (
          <p className="text-xs text-ink/50">Select a size and colour to check availability</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="label mb-0">Qty</span>
        <div className="flex items-center border border-sandline">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-lg"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="flex h-10 w-10 items-center justify-center font-mono text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(variant?.stock || 10, q + 1))}
            className="flex h-10 w-10 items-center justify-center text-lg"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {error && <p className="text-xs font-semibold text-clay">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={handleAddToCart} className="btn-secondary flex-1">
          {added ? 'Added to cart ✓' : 'Add to Cart'}
        </button>
        <button onClick={handleBuyNow} className="btn-primary flex-1">
          Buy Now
        </button>
      </div>
    </div>
  );
}
