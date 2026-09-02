import { db } from '@/db';
import { newId } from '@/lib/ids';
import type { Review } from '@/lib/types';
import { recomputeProductRating } from '@/lib/models/products';

function parseRow(row: any): Review | undefined {
  if (!row) return undefined;
  return { ...row, is_approved: !!row.is_approved };
}

export function getApprovedReviewsForProduct(productId: string): Review[] {
  const rows = db
    .prepare(
      `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ? AND r.is_approved = 1 ORDER BY r.created_at DESC`
    )
    .all(productId) as any[];
  return rows.map((r) => parseRow(r)!);
}

export function getAllReviewsForAdmin(): Review[] {
  const rows = db
    .prepare(
      `SELECT r.*, u.name as user_name, p.name as product_name FROM reviews r
       JOIN users u ON u.id = r.user_id JOIN products p ON p.id = r.product_id
       ORDER BY r.created_at DESC`
    )
    .all() as any[];
  return rows.map((r) => parseRow(r)!);
}

export function createReview(input: { productId: string; userId: string; rating: number; comment: string }): Review {
  const id = newId('rev');
  db.prepare('INSERT INTO reviews (id, product_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)').run(
    id,
    input.productId,
    input.userId,
    input.rating,
    input.comment
  );
  return parseRow(db.prepare('SELECT * FROM reviews WHERE id = ?').get(id))!;
}

export function setReviewApproval(id: string, isApproved: boolean): void {
  const row = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as any;
  db.prepare('UPDATE reviews SET is_approved = ? WHERE id = ?').run(isApproved ? 1 : 0, id);
  if (row) recomputeProductRating(row.product_id);
}

export function deleteReview(id: string): void {
  const row = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as any;
  db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
  if (row) recomputeProductRating(row.product_id);
}

export function userHasReviewed(productId: string, userId: string): boolean {
  const row = db.prepare('SELECT 1 FROM reviews WHERE product_id = ? AND user_id = ?').get(productId, userId);
  return !!row;
}
