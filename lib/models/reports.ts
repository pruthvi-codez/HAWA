import { db } from '@/db';

export function getDashboardStats() {
  const totalSales = (db.prepare("SELECT COALESCE(SUM(total_amount),0) as v FROM orders WHERE status != 'Cancelled'").get() as { v: number }).v;

  const todayOrders = (
    db.prepare("SELECT COUNT(*) as c FROM orders WHERE date(created_at) = date('now')").get() as { c: number }
  ).c;

  const monthlyRevenue = (
    db
      .prepare(
        "SELECT COALESCE(SUM(total_amount),0) as v FROM orders WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') AND status != 'Cancelled'"
      )
      .get() as { v: number }
  ).v;

  const statusCounts = db
    .prepare('SELECT status, COUNT(*) as count FROM orders GROUP BY status')
    .all() as { status: string; count: number }[];

  const newCustomers30d = (
    db
      .prepare("SELECT COUNT(*) as c FROM users WHERE role='customer' AND created_at >= datetime('now','-30 days')")
      .get() as { c: number }
  ).c;

  const totalCustomers = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role='customer'").get() as { c: number }).c;

  const topProducts = db
    .prepare(
      `SELECT p.id, p.name, p.slug, p.sold_count, p.images
       FROM products p ORDER BY p.sold_count DESC LIMIT 5`
    )
    .all() as any[];

  const lowStock = db
    .prepare(
      `SELECT v.id, v.size, v.color, v.stock, p.name as product_name, p.slug as product_slug
       FROM product_variants v JOIN products p ON p.id = v.product_id
       WHERE v.stock <= v.low_stock_threshold ORDER BY v.stock ASC LIMIT 8`
    )
    .all() as any[];

  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 8').all();

  return {
    totalSales,
    todayOrders,
    monthlyRevenue,
    statusCounts,
    newCustomers30d,
    totalCustomers,
    topProducts: topProducts.map((p) => ({ ...p, images: JSON.parse(p.images || '[]') })),
    lowStock,
    recentOrders,
  };
}

export function getSalesByDay(days = 14) {
  return db
    .prepare(
      `SELECT date(created_at) as day, COALESCE(SUM(total_amount),0) as revenue, COUNT(*) as orders
       FROM orders
       WHERE created_at >= datetime('now', ?) AND status != 'Cancelled'
       GROUP BY day ORDER BY day ASC`
    )
    .all(`-${days} days`) as { day: string; revenue: number; orders: number }[];
}

export function getSalesByCategory() {
  return db
    .prepare(
      `SELECT c.name as category, COALESCE(SUM(oi.unit_price * oi.quantity), 0) as revenue, SUM(oi.quantity) as units
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN categories c ON c.id = p.category_id
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status != 'Cancelled'
       GROUP BY c.id ORDER BY revenue DESC`
    )
    .all() as { category: string; revenue: number; units: number }[];
}

export function getTopProductsReport(limit = 10) {
  return db
    .prepare(
      `SELECT p.name, p.slug, p.sold_count,
        COALESCE(SUM(oi.unit_price * oi.quantity), 0) as revenue
       FROM products p
       LEFT JOIN order_items oi ON oi.product_id = p.id
       LEFT JOIN orders o ON o.id = oi.order_id AND o.status != 'Cancelled'
       GROUP BY p.id ORDER BY revenue DESC LIMIT ?`
    )
    .all(limit) as { name: string; slug: string; sold_count: number; revenue: number }[];
}

export function getAllOrdersFlatForExport() {
  return db
    .prepare(
      `SELECT order_number, created_at, shipping_name, shipping_phone, shipping_city, shipping_state,
              status, payment_method, payment_status, subtotal, discount, shipping_charge, total_amount
       FROM orders ORDER BY created_at DESC`
    )
    .all() as any[];
}
