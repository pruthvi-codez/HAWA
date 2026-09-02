import { db } from '@/db';
import { newId } from '@/lib/ids';
import type { Category } from '@/lib/types';

export function getAllCategories(): Category[] {
  return db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all() as Category[];
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as Category | undefined;
}

export function getCategoryById(id: string): Category | undefined {
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined;
}

export function createCategory(input: { name: string; slug: string; parent_id?: string | null; sort_order?: number }): Category {
  const id = newId('cat');
  db.prepare(
    'INSERT INTO categories (id, name, slug, parent_id, sort_order) VALUES (?, ?, ?, ?, ?)'
  ).run(id, input.name, input.slug, input.parent_id || null, input.sort_order ?? 0);
  return getCategoryById(id)!;
}

export function updateCategory(id: string, input: Partial<{ name: string; slug: string; parent_id: string | null; sort_order: number }>): void {
  const current = getCategoryById(id);
  if (!current) throw new Error('Category not found');
  db.prepare('UPDATE categories SET name = ?, slug = ?, parent_id = ?, sort_order = ? WHERE id = ?').run(
    input.name ?? current.name,
    input.slug ?? current.slug,
    input.parent_id === undefined ? current.parent_id : input.parent_id,
    input.sort_order ?? current.sort_order,
    id
  );
}

export function deleteCategory(id: string): void {
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
}
