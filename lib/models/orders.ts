import { db } from '@/db';
import { newId, newOrderNumber } from '@/lib/ids';
import type { Order, OrderItem, OrderStatus, PaymentMethod } from '@/lib/types';
import { decrementVariantStock, getVariant, getProductById, incrementSoldCount } from '@/lib/models/products';
import { incrementCouponUsage, validateCoupon } from '@/lib/models/coupons';

function parseOrderRow(row: any): Order {
  return { ...row };
}

export function getOrderItems(orderId: string): OrderItem[] {
  return db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId) as OrderItem[];
}

export function getOrderById(id: string): Order | undefined {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!row) return undefined;
  const order = parseOrderRow(row);
  order.items = getOrderItems(id);
  return order;
}

export function getOrderByNumber(orderNumber: string): Order | undefined {
  const row = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as any;
  if (!row) return undefined;
  const order = parseOrderRow(row);
  order.items = getOrderItems(order.id);
  return order;
}

export function getOrdersForUser(userId: string): Order[] {
  const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
  return rows.map((r) => {
    const o = parseOrderRow(r);
    o.items = getOrderItems(o.id);
    return o;
  });
}

export interface OrderListFilters {
  status?: OrderStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function listOrdersForAdmin(filters: OrderListFilters) {
  const page = Math.max(1, filters.page || 1);
  const pageSize = filters.pageSize || 20;
  const where: string[] = [];
  const params: any[] = [];

  if (filters.status) {
    where.push('status = ?');
    params.push(filters.status);
  }
  if (filters.search) {
    where.push('(order_number LIKE ? OR shipping_name LIKE ? OR shipping_phone LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = (db.prepare(`SELECT COUNT(*) as c FROM orders ${whereClause}`).get(...params) as { c: number }).c;
  const rows = db
    .prepare(`SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, pageSize, (page - 1) * pageSize) as any[];

  return {
    orders: rows.map((r) => {
      const o = parseOrderRow(r);
      o.items = getOrderItems(o.id);
      return o;
    }),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export interface CreateOrderInput {
  userId: string | null;
  guestEmail: string | null;
  items: Array<{ productId: string; size: string; color: string; quantity: number }>;
  couponCode?: string | null;
  shipping: {
    name: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  shippingMethod: string;
  shippingCharge: number;
  paymentMethod: PaymentMethod;
}

export interface CreateOrderResult {
  order?: Order;
  error?: string;
}

/**
 * Validates stock, computes totals, applies a coupon, decrements variant stock,
 * and creates the order + order items — all inside a single DB transaction so a
 * failure partway through never leaves stock or totals inconsistent.
 */
export function createOrder(input: CreateOrderInput): CreateOrderResult {
  const run = db.transaction((): CreateOrderResult => {
    if (input.items.length === 0) {
      return { error: 'Your cart is empty.' };
    }

    let subtotal = 0;
    const resolvedLines: Array<{
      product: ReturnType<typeof getProductById>;
      variant: ReturnType<typeof getVariant>;
      quantity: number;
      unitPrice: number;
    }> = [];

    for (const line of input.items) {
      const product = getProductById(line.productId);
      if (!product || !product.is_published) {
        return { error: `A product in your cart is no longer available.` };
      }
      const variant = getVariant(line.productId, line.size, line.color);
      if (!variant) {
        return { error: `${product.name} is not available in size ${line.size} / ${line.color}.` };
      }
      if (variant.stock < line.quantity) {
        return {
          error: `Only ${variant.stock} left of ${product.name} (${line.size} / ${line.color}). Please adjust the quantity.`,
        };
      }
      const unitPrice = product.discount_price ?? product.base_price;
      subtotal += unitPrice * line.quantity;
      resolvedLines.push({ product, variant, quantity: line.quantity, unitPrice });
    }

    let discount = 0;
    let appliedCouponCode: string | null = null;
    if (input.couponCode) {
      const validation = validateCoupon(input.couponCode, subtotal);
      if (!validation.valid) {
        return { error: validation.message };
      }
      discount = validation.discountAmount || 0;
      appliedCouponCode = input.couponCode.toUpperCase();
    }

    const totalAmount = Math.max(0, subtotal - discount) + input.shippingCharge;
    const orderId = newId('order');
    const orderNumber = newOrderNumber();
    const paymentStatus = input.paymentMethod === 'COD' ? 'Pending' : 'Paid';

    db.prepare(
      `INSERT INTO orders
        (id, order_number, user_id, guest_email, subtotal, discount, coupon_code, shipping_charge, total_amount,
         status, shipping_name, shipping_phone, shipping_address_line, shipping_city, shipping_state, shipping_pincode,
         shipping_method, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      orderId,
      orderNumber,
      input.userId,
      input.guestEmail,
      subtotal,
      discount,
      appliedCouponCode,
      input.shippingCharge,
      totalAmount,
      'Pending',
      input.shipping.name,
      input.shipping.phone,
      input.shipping.addressLine,
      input.shipping.city,
      input.shipping.state,
      input.shipping.pincode,
      input.shippingMethod,
      input.paymentMethod,
      paymentStatus
    );

    const insertItem = db.prepare(
      `INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, image, size, color, unit_price, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const line of resolvedLines) {
      insertItem.run(
        newId('item'),
        orderId,
        line.product!.id,
        line.variant!.id,
        line.product!.name,
        line.product!.images[0] || null,
        line.variant!.size,
        line.variant!.color,
        line.unitPrice,
        line.quantity
      );
      decrementVariantStock(line.variant!.id, line.quantity);
      incrementSoldCount(line.product!.id, line.quantity);
    }

    if (appliedCouponCode) {
      incrementCouponUsage(appliedCouponCode);
    }

    return { order: getOrderById(orderId) };
  });

  return run();
}

export function updateOrderStatus(id: string, status: OrderStatus): void {
  db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
}

export function updateOrderTracking(id: string, input: { courier_name?: string; tracking_number?: string; tracking_url?: string }): void {
  const current = getOrderById(id);
  if (!current) throw new Error('Order not found');
  db.prepare(
    "UPDATE orders SET courier_name = ?, tracking_number = ?, tracking_url = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(
    input.courier_name ?? current.courier_name,
    input.tracking_number ?? current.tracking_number,
    input.tracking_url ?? current.tracking_url,
    id
  );
}

export function updatePaymentStatus(id: string, paymentStatus: string): void {
  db.prepare("UPDATE orders SET payment_status = ?, updated_at = datetime('now') WHERE id = ?").run(paymentStatus, id);
}
