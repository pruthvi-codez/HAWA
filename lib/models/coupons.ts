import { db } from '@/db';
import { newId } from '@/lib/ids';
import type { Coupon } from '@/lib/types';

function parseRow(row: any): Coupon | undefined {
  if (!row) return undefined;
  return { ...row, is_active: !!row.is_active };
}

export function getAllCoupons(): Coupon[] {
  const rows = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => parseRow(r)!);
}

export function getCouponByCode(code: string): Coupon | undefined {
  return parseRow(db.prepare('SELECT * FROM coupons WHERE code = ?').get(code.toUpperCase()));
}

export function getCouponById(id: string): Coupon | undefined {
  return parseRow(db.prepare('SELECT * FROM coupons WHERE id = ?').get(id));
}

export function createCoupon(input: {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  start_date?: string | null;
  expiry_date?: string | null;
  usage_limit?: number | null;
  is_active: boolean;
}): Coupon {
  const id = newId('coup');
  db.prepare(
    `INSERT INTO coupons (id, code, type, value, min_order_amount, start_date, expiry_date, usage_limit, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.code.toUpperCase(),
    input.type,
    input.value,
    input.min_order_amount,
    input.start_date || null,
    input.expiry_date || null,
    input.usage_limit ?? null,
    input.is_active ? 1 : 0
  );
  return getCouponById(id)!;
}

export function updateCoupon(id: string, input: Partial<{ is_active: boolean; usage_limit: number | null; expiry_date: string | null; value: number; min_order_amount: number }>): void {
  const current = getCouponById(id);
  if (!current) throw new Error('Coupon not found');
  db.prepare('UPDATE coupons SET is_active = ?, usage_limit = ?, expiry_date = ?, value = ?, min_order_amount = ? WHERE id = ?').run(
    (input.is_active ?? current.is_active) ? 1 : 0,
    input.usage_limit === undefined ? current.usage_limit : input.usage_limit,
    input.expiry_date === undefined ? current.expiry_date : input.expiry_date,
    input.value ?? current.value,
    input.min_order_amount ?? current.min_order_amount,
    id
  );
}

export function deleteCoupon(id: string): void {
  db.prepare('DELETE FROM coupons WHERE id = ?').run(id);
}

export function incrementCouponUsage(code: string): void {
  db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?').run(code.toUpperCase());
}

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  coupon?: Coupon;
  discountAmount?: number;
}

export function validateCoupon(code: string, subtotal: number): CouponValidationResult {
  const coupon = getCouponByCode(code);
  if (!coupon) return { valid: false, message: 'This coupon code does not exist.' };
  if (!coupon.is_active) return { valid: false, message: 'This coupon is no longer active.' };

  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    return { valid: false, message: 'This coupon is not active yet.' };
  }
  if (coupon.expiry_date && new Date(coupon.expiry_date) < now) {
    return { valid: false, message: 'This coupon has expired.' };
  }
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, message: 'This coupon has reached its usage limit.' };
  }
  if (subtotal < coupon.min_order_amount) {
    return { valid: false, message: `Add ₹${(coupon.min_order_amount - subtotal).toFixed(0)} more to use this coupon.` };
  }

  const discountAmount =
    coupon.type === 'percentage' ? Math.round((subtotal * coupon.value) / 100) : Math.min(coupon.value, subtotal);

  return { valid: true, coupon, discountAmount };
}
