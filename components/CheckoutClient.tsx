'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import type { Address } from '@/lib/types';
import { formatINR } from '@/lib/utils';

interface Props {
  isLoggedIn: boolean;
  addresses: Address[];
  shipping: { standard_charge: number; standard_days: string; express_charge: number; express_days: string; free_shipping_threshold: number };
  payment: { enable_upi: boolean; enable_card: boolean; enable_netbanking: boolean; enable_wallet: boolean; enable_cod: boolean; cod_limit: number };
  initialCoupon: string;
}

type PaymentMethod = 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'COD';

export default function CheckoutClient({ isLoggedIn, addresses, shipping, payment, initialCoupon }: Props) {
  const { lines, subtotal, clearCart, isHydrated } = useCart();
  const router = useRouter();

  const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddress?.id || 'new');

  const [guestEmail, setGuestEmail] = useState('');
  const [name, setName] = useState(defaultAddress?.name || '');
  const [phone, setPhone] = useState(defaultAddress?.phone || '');
  const [addressLine, setAddressLine] = useState(defaultAddress?.address_line || '');
  const [city, setCity] = useState(defaultAddress?.city || '');
  const [state, setState] = useState(defaultAddress?.state || '');
  const [pincode, setPincode] = useState(defaultAddress?.pincode || '');
  const [saveAddress, setSaveAddress] = useState(false);

  const [shippingMethod, setShippingMethod] = useState<'Standard' | 'Express'>('Standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(payment.enable_upi ? 'UPI' : 'COD');

  const [couponInput, setCouponInput] = useState(initialCoupon);
  const [couponResult, setCouponResult] = useState<{ valid: boolean; message?: string; discountAmount?: number } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && lines.length === 0) {
      router.replace('/cart');
    }
  }, [isHydrated, lines.length, router]);

  useEffect(() => {
    if (initialCoupon) {
      fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: initialCoupon, subtotal }),
      })
        .then((r) => r.json())
        .then(setCouponResult)
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyAddress(id: string) {
    setSelectedAddressId(id);
    if (id === 'new') {
      setName('');
      setPhone('');
      setAddressLine('');
      setCity('');
      setState('');
      setPincode('');
      return;
    }
    const addr = addresses.find((a) => a.id === id);
    if (addr) {
      setName(addr.name);
      setPhone(addr.phone);
      setAddressLine(addr.address_line);
      setCity(addr.city);
      setState(addr.state);
      setPincode(addr.pincode);
    }
  }

  const discount = couponResult?.valid ? couponResult.discountAmount || 0 : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shippingCharge =
    shippingMethod === 'Express'
      ? shipping.express_charge
      : afterDiscount >= shipping.free_shipping_threshold
      ? 0
      : shipping.standard_charge;
  const total = afterDiscount + shippingCharge;
  const codAvailable = payment.enable_cod && total <= payment.cod_limit;

  async function checkCoupon() {
    if (!couponInput.trim()) {
      setCouponResult(null);
      return;
    }
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponInput.trim(), subtotal }),
    });
    setCouponResult(await res.json());
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (paymentMethod === 'COD' && !codAvailable) {
      setError(`Cash on Delivery is only available for orders under ${formatINR(payment.cod_limit)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestEmail: isLoggedIn ? undefined : guestEmail,
          items: lines.map((l) => ({ productId: l.productId, size: l.size, color: l.color, quantity: l.quantity })),
          couponCode: couponResult?.valid ? couponInput.trim() : undefined,
          shipping: { name, phone, addressLine, city, state, pincode },
          shippingMethod,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong placing your order.');
        setSubmitting(false);
        return;
      }

      if (isLoggedIn && saveAddress && selectedAddressId === 'new') {
        fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, address_line: addressLine, city, state, pincode, is_default: addresses.length === 0 }),
        }).catch(() => {});
      }

      clearCart();
      router.push(`/order-confirmation/${data.order.order_number}`);
    } catch {
      setError('Network error — please try again.');
      setSubmitting(false);
    }
  }

  if (!isHydrated || lines.length === 0) {
    return <div className="container-page py-24 text-center text-sm text-ink/50">Loading checkout…</div>;
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-3xl font-black uppercase tracking-tight">Checkout</h1>

      <form onSubmit={placeOrder} className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          {!isLoggedIn && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Contact</h2>
              <label className="label">Email address</label>
              <input
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@email.com"
                className="input"
              />
              <p className="mt-2 text-xs text-ink/50">
                Have an account?{' '}
                <Link href="/login?next=/checkout" className="font-semibold text-indigo hover:underline">
                  Log in
                </Link>{' '}
                for faster checkout, or continue as a guest below.
              </p>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Shipping Address</h2>

            {isLoggedIn && addresses.length > 0 && (
              <div className="mb-4 space-y-2">
                {addresses.map((a) => (
                  <label key={a.id} className="flex cursor-pointer items-start gap-3 border border-sandline p-3 text-sm has-[:checked]:border-ink">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === a.id}
                      onChange={() => applyAddress(a.id)}
                      className="mt-1 accent-ink"
                    />
                    <span>
                      <span className="font-semibold">{a.name}</span> · {a.phone}
                      <br />
                      <span className="text-ink/60">{a.address_line}, {a.city}, {a.state} {a.pincode}</span>
                    </span>
                  </label>
                ))}
                <label className="flex cursor-pointer items-center gap-3 border border-sandline p-3 text-sm has-[:checked]:border-ink">
                  <input type="radio" name="address" checked={selectedAddressId === 'new'} onChange={() => applyAddress('new')} className="accent-ink" />
                  Use a new address
                </label>
              </div>
            )}

            {(selectedAddressId === 'new' || addresses.length === 0) && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Full name</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Phone number</label>
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="10-digit mobile number" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address</label>
                  <input required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="input" placeholder="House no, street, area" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input required value={city} onChange={(e) => setCity(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="label">State</label>
                  <input required value={state} onChange={(e) => setState(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input required value={pincode} onChange={(e) => setPincode(e.target.value)} className="input" />
                </div>
                {isLoggedIn && (
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="accent-ink" />
                    Save this address for future orders
                  </label>
                )}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Shipping Method</h2>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center justify-between border border-sandline p-3 text-sm has-[:checked]:border-ink">
                <span className="flex items-center gap-3">
                  <input type="radio" checked={shippingMethod === 'Standard'} onChange={() => setShippingMethod('Standard')} className="accent-ink" />
                  Standard — {shipping.standard_days}
                </span>
                <span className="font-mono">{afterDiscount >= shipping.free_shipping_threshold ? 'Free' : formatINR(shipping.standard_charge)}</span>
              </label>
              <label className="flex cursor-pointer items-center justify-between border border-sandline p-3 text-sm has-[:checked]:border-ink">
                <span className="flex items-center gap-3">
                  <input type="radio" checked={shippingMethod === 'Express'} onChange={() => setShippingMethod('Express')} className="accent-ink" />
                  Express — {shipping.express_days}
                </span>
                <span className="font-mono">{formatINR(shipping.express_charge)}</span>
              </label>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Payment Method</h2>
            <div className="space-y-2 text-sm">
              {payment.enable_upi && <PaymentOption id="UPI" label="UPI (GPay, PhonePe, Paytm)" current={paymentMethod} set={setPaymentMethod} />}
              {payment.enable_card && <PaymentOption id="Card" label="Credit / Debit Card" current={paymentMethod} set={setPaymentMethod} />}
              {payment.enable_netbanking && <PaymentOption id="NetBanking" label="Net Banking" current={paymentMethod} set={setPaymentMethod} />}
              {payment.enable_wallet && <PaymentOption id="Wallet" label="Wallets" current={paymentMethod} set={setPaymentMethod} />}
              {payment.enable_cod && (
                <PaymentOption id="COD" label={`Cash on Delivery${!codAvailable ? ` (unavailable over ${formatINR(payment.cod_limit)})` : ''}`} current={paymentMethod} set={setPaymentMethod} disabled={!codAvailable} />
              )}
            </div>
            {paymentMethod !== 'COD' && (
              <p className="mt-3 border border-dashed border-sandline p-3 text-xs text-ink/50">
                This is a demo checkout — no real payment gateway is connected. Placing the order will mark it as paid immediately. In
                production this step hands off to a gateway such as Razorpay or Stripe.
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit space-y-5 border border-sandline p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Order Summary</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {lines.map((l) => (
              <div key={`${l.productId}-${l.size}-${l.color}`} className="flex justify-between gap-3 text-xs">
                <span className="text-ink/70">
                  {l.name} ({l.size}/{l.color}) × {l.quantity}
                </span>
                <span className="shrink-0 font-mono">{formatINR(l.price * l.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t border-sandline pt-4">
            <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" className="input" />
            <button type="button" onClick={checkCoupon} className="btn-secondary shrink-0 !px-4">
              Apply
            </button>
          </div>
          {couponResult && (
            <p className={`text-xs font-semibold ${couponResult.valid ? 'text-okgreen' : 'text-clay'}`}>
              {couponResult.valid ? 'Coupon applied.' : couponResult.message}
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
              <span>{shippingCharge === 0 ? 'Free' : formatINR(shippingCharge)}</span>
            </div>
            <div className="flex justify-between border-t border-sandline pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-clay">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
        </aside>
      </form>
    </div>
  );
}

function PaymentOption({
  id,
  label,
  current,
  set,
  disabled,
}: {
  id: PaymentMethod;
  label: string;
  current: PaymentMethod;
  set: (v: PaymentMethod) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 border border-sandline p-3 has-[:checked]:border-ink ${disabled ? 'opacity-40' : ''}`}>
      <input type="radio" checked={current === id} onChange={() => set(id)} disabled={disabled} className="accent-ink" />
      {label}
    </label>
  );
}
