'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/utils';

export default function CartPageClient({ shipping }: { shipping: { standard_charge: number; free_shipping_threshold: number } }) {
  const { lines, updateQuantity, removeLine, clearCart, subtotal, isHydrated } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponResult, setCouponResult] = useState<{ valid: boolean; message?: string; discountAmount?: number; code?: string } | null>(
    null
  );
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const discount = couponResult?.valid ? couponResult.discountAmount || 0 : 0;
  const shippingEstimate = subtotal - discount >= shipping.free_shipping_threshold || subtotal === 0 ? 0 : shipping.standard_charge;
  const total = Math.max(0, subtotal - discount) + shippingEstimate;

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      setCouponResult({ ...data, code: couponInput.trim().toUpperCase() });
    } finally {
      setCheckingCoupon(false);
    }
  }

  if (!isHydrated) {
    return <div className="container-page py-24 text-center text-sm text-ink/50">Loading your cart…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-2xl font-black uppercase">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ink/60">Looks like you haven&rsquo;t added anything yet.</p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-3xl font-black uppercase tracking-tight">Your Cart</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="hidden border-b border-sandline pb-3 text-xs font-semibold uppercase tracking-wide text-ink/50 sm:grid sm:grid-cols-[80px_1fr_120px_100px_32px] sm:gap-4">
            <span>Item</span>
            <span></span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Price</span>
            <span></span>
          </div>

          <div className="divide-y divide-sandline">
            {lines.map((line) => (
              <div
                key={`${line.productId}-${line.size}-${line.color}`}
                className="grid grid-cols-[80px_1fr] gap-4 py-6 sm:grid-cols-[80px_1fr_120px_100px_32px] sm:items-center"
              >
                <Link href={`/product/${line.slug}`} className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-sand">
                  <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover" />
                </Link>

                <div>
                  <Link href={`/product/${line.slug}`} className="text-sm font-semibold hover:text-indigo">
                    {line.name}
                  </Link>
                  <p className="mt-1 text-xs text-ink/50">
                    Size: {line.size} · Colour: {line.color}
                  </p>
                  <p className="mt-1 font-mono text-xs text-ink/60 sm:hidden">{formatINR(line.price)}</p>
                </div>

                <div className="mt-3 flex items-center gap-0 sm:mt-0 sm:justify-center">
                  <div className="flex items-center border border-sandline">
                    <button
                      onClick={() => updateQuantity(line.productId, line.size, line.color, line.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="flex h-9 w-9 items-center justify-center font-mono text-sm">{line.quantity}</span>
                    <button
                      onClick={() => updateQuantity(line.productId, line.size, line.color, line.quantity + 1)}
                      disabled={line.quantity >= line.maxStock}
                      className="flex h-9 w-9 items-center justify-center disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <p className="hidden text-right font-mono text-sm sm:block">{formatINR(line.price * line.quantity)}</p>

                <button
                  onClick={() => removeLine(line.productId, line.size, line.color)}
                  aria-label="Remove item"
                  className="justify-self-end text-ink/40 hover:text-clay sm:justify-self-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Link href="/shop" className="text-sm font-semibold uppercase tracking-wide text-indigo hover:underline">
              ← Continue Shopping
            </Link>
            <button onClick={clearCart} className="text-sm font-semibold uppercase tracking-wide text-ink/50 hover:text-clay">
              Clear Cart
            </button>
          </div>
        </div>

        <div className="h-fit border border-sandline p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Order Summary</h2>

          <div className="mb-4 flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Coupon code"
              className="input"
            />
            <button onClick={applyCoupon} disabled={checkingCoupon} className="btn-secondary shrink-0 !px-4">
              Apply
            </button>
          </div>
          {couponResult && (
            <p className={`mb-4 text-xs font-semibold ${couponResult.valid ? 'text-okgreen' : 'text-clay'}`}>
              {couponResult.valid ? `Coupon ${couponResult.code} applied.` : couponResult.message}
            </p>
          )}

          <div className="space-y-2 border-t border-sandline pt-4 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-ink/60">Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-okgreen">
                <span>Discount</span>
                <span>−{formatINR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink/60">Shipping</span>
              <span>{shippingEstimate === 0 ? 'Free' : formatINR(shippingEstimate)}</span>
            </div>
            <div className="flex justify-between border-t border-sandline pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          <Link
            href={{ pathname: '/checkout', query: couponResult?.valid ? { coupon: couponResult.code } : {} }}
            className="btn-primary mt-6 flex w-full"
          >
            Proceed to Checkout
          </Link>
          <p className="mt-3 text-center text-xs text-ink/50">Taxes included. Shipping calculated at checkout.</p>
        </div>
      </div>
    </div>
  );
}
