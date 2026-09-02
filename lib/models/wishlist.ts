import { db } from '@/db';
import { newId } from '@/lib/ids';
import type { Product } from '@/lib/types';

export function getWishlistProducts(userId: string): Product[] {
  const rows = db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug, w.created_at as wishlisted_at
       FROM wishlist_items w
       JOIN products p ON p.id = w.product_id
       JOIN categories c ON c.id = p.category_id
       WHERE w.user_id = ? ORDER BY w.created_at DESC`
    )
    .all(userId) as any[];
  return rows.map((row) => ({
    ...row,
    images: JSON.parse(row.images || '[]'),
    sizes: JSON.parse(row.sizes || '[]'),
    colors: JSON.parse(row.colors || '[]'),
    is_featured: !!row.is_featured,
    is_published: !!row.is_published,
  }));
}

export function isInWishlist(userId: string, productId: string): boolean {
  const row = db.prepare('SELECT 1 FROM wishlist_items WHERE user_id = ? AND product_id = ?').get(userId, productId);
  return !!row;
}

export function addToWishlist(userId: string, productId: string): void {
  db.prepare('INSERT OR IGNORE INTO wishlist_items (id, user_id, product_id) VALUES (?, ?, ?)').run(
    newId('wish'),
    userId,
    productId
  );
}

export function removeFromWishlist(userId: string, productId: string): void {
  db.prepare('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?').run(userId, productId);
}
