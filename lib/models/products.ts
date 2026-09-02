import { db } from '@/db';
import { newId } from '@/lib/ids';
import type { Product, ProductVariant } from '@/lib/types';

function parseProductRow(row: any): Product {
  return {
    ...row,
    images: JSON.parse(row.images || '[]'),
    sizes: JSON.parse(row.sizes || '[]'),
    colors: JSON.parse(row.colors || '[]'),
    is_featured: !!row.is_featured,
    is_published: !!row.is_published,
  };
}

export function getVariantsForProduct(productId: string): ProductVariant[] {
  return db.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY size, color').all(productId) as ProductVariant[];
}

export function attachVariants(product: Product): Product {
  const variants = getVariantsForProduct(product.id);
  const total_stock = variants.reduce((sum, v) => sum + v.stock, 0);
  return { ...product, variants, total_stock };
}

export function getProductById(id: string): Product | undefined {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
  return row ? parseProductRow(row) : undefined;
}

export function getProductBySlug(slug: string): Product | undefined {
  const row = db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.slug = ?`
    )
    .get(slug) as any;
  return row ? parseProductRow(row) : undefined;
}

export interface ProductFilters {
  categorySlug?: string;
  search?: string;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popularity';
  page?: number;
  pageSize?: number;
  includeUnpublished?: boolean;
  featuredOnly?: boolean;
}

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function listProducts(filters: ProductFilters): ProductListResult {
  const page = Math.max(1, filters.page || 1);
  const pageSize = filters.pageSize || 12;
  const where: string[] = [];
  const params: any[] = [];

  if (!filters.includeUnpublished) {
    where.push('p.is_published = 1');
  }
  if (filters.categorySlug) {
    where.push('c.slug = ?');
    params.push(filters.categorySlug);
  }
  if (filters.search) {
    where.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  if (filters.minPrice !== undefined) {
    where.push('COALESCE(p.discount_price, p.base_price) >= ?');
    params.push(filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    where.push('COALESCE(p.discount_price, p.base_price) <= ?');
    params.push(filters.maxPrice);
  }
  if (filters.featuredOnly) {
    where.push('p.is_featured = 1');
  }
  if (filters.sizes && filters.sizes.length > 0) {
    const placeholders = filters.sizes.map(() => '?').join(',');
    where.push(`EXISTS (SELECT 1 FROM json_each(p.sizes) WHERE json_each.value IN (${placeholders}))`);
    params.push(...filters.sizes);
  }
  if (filters.colors && filters.colors.length > 0) {
    const placeholders = filters.colors.map(() => '?').join(',');
    where.push(`EXISTS (SELECT 1 FROM json_each(p.colors) WHERE json_each.value IN (${placeholders}))`);
    params.push(...filters.colors);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  let orderBy = 'p.created_at DESC';
  if (filters.sort === 'price-asc') orderBy = 'COALESCE(p.discount_price, p.base_price) ASC';
  else if (filters.sort === 'price-desc') orderBy = 'COALESCE(p.discount_price, p.base_price) DESC';
  else if (filters.sort === 'popularity') orderBy = 'p.sold_count DESC';

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM products p JOIN categories c ON c.id = p.category_id ${whereClause}`)
    .get(...params) as { count: number };
  const total = totalRow.count;

  const rows = db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p JOIN categories c ON c.id = p.category_id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`
    )
    .all(...params, pageSize, (page - 1) * pageSize) as any[];

  return {
    products: rows.map(parseProductRow),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const rows = db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.category_id = ? AND p.id != ? AND p.is_published = 1
       ORDER BY p.sold_count DESC LIMIT ?`
    )
    .all(product.category_id, product.id, limit) as any[];
  return rows.map(parseProductRow);
}

export interface ProductInput {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  base_price: number;
  discount_price?: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  material: string;
  care_instructions: string;
  sku_prefix: string;
  is_featured: boolean;
  is_published: boolean;
}

export function createProduct(input: ProductInput): Product {
  const id = newId('prod');
  db.prepare(
    `INSERT INTO products
      (id, name, slug, description, category_id, base_price, discount_price, images, sizes, colors, material, care_instructions, sku_prefix, is_featured, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.name,
    input.slug,
    input.description,
    input.category_id,
    input.base_price,
    input.discount_price ?? null,
    JSON.stringify(input.images),
    JSON.stringify(input.sizes),
    JSON.stringify(input.colors),
    input.material,
    input.care_instructions,
    input.sku_prefix,
    input.is_featured ? 1 : 0,
    input.is_published ? 1 : 0
  );

  // Create a variant row for every size x color combination with zero stock by default.
  const insertVariant = db.prepare(
    `INSERT INTO product_variants (id, product_id, size, color, sku, stock, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const sizes = input.sizes.length ? input.sizes : ['One Size'];
  const colors = input.colors.length ? input.colors : ['Default'];
  for (const size of sizes) {
    for (const color of colors) {
      const sku = `${input.sku_prefix}-${size}-${color}`.toUpperCase().replace(/\s+/g, '');
      insertVariant.run(newId('var'), id, size, color, sku, 0, 5);
    }
  }

  return getProductById(id)!;
}

export function updateProduct(id: string, input: Partial<ProductInput>): void {
  const current = getProductById(id);
  if (!current) throw new Error('Product not found');
  db.prepare(
    `UPDATE products SET
      name = ?, slug = ?, description = ?, category_id = ?, base_price = ?, discount_price = ?,
      images = ?, sizes = ?, colors = ?, material = ?, care_instructions = ?, sku_prefix = ?,
      is_featured = ?, is_published = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    input.name ?? current.name,
    input.slug ?? current.slug,
    input.description ?? current.description,
    input.category_id ?? current.category_id,
    input.base_price ?? current.base_price,
    input.discount_price === undefined ? current.discount_price : input.discount_price,
    JSON.stringify(input.images ?? current.images),
    JSON.stringify(input.sizes ?? current.sizes),
    JSON.stringify(input.colors ?? current.colors),
    input.material ?? current.material,
    input.care_instructions ?? current.care_instructions,
    input.sku_prefix ?? current.sku_prefix,
    (input.is_featured ?? current.is_featured) ? 1 : 0,
    (input.is_published ?? current.is_published) ? 1 : 0,
    id
  );
}

export function deleteProduct(id: string): void {
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
}

export function setVariantStock(variantId: string, stock: number): void {
  db.prepare('UPDATE product_variants SET stock = ? WHERE id = ?').run(stock, variantId);
}

export function getVariant(productId: string, size: string, color: string): ProductVariant | undefined {
  return db
    .prepare('SELECT * FROM product_variants WHERE product_id = ? AND size = ? AND color = ?')
    .get(productId, size, color) as ProductVariant | undefined;
}

export function getVariantById(id: string): ProductVariant | undefined {
  return db.prepare('SELECT * FROM product_variants WHERE id = ?').get(id) as ProductVariant | undefined;
}

export function decrementVariantStock(variantId: string, quantity: number): void {
  db.prepare('UPDATE product_variants SET stock = MAX(0, stock - ?) WHERE id = ?').run(quantity, variantId);
}

export function incrementSoldCount(productId: string, quantity: number): void {
  db.prepare('UPDATE products SET sold_count = sold_count + ? WHERE id = ?').run(quantity, productId);
}

export function getLowStockVariants(threshold?: number): (ProductVariant & { product_name: string; product_slug: string })[] {
  const rows = db
    .prepare(
      `SELECT v.*, p.name as product_name, p.slug as product_slug
       FROM product_variants v JOIN products p ON p.id = v.product_id
       WHERE v.stock <= COALESCE(?, v.low_stock_threshold)
       ORDER BY v.stock ASC`
    )
    .all(threshold ?? null) as any[];
  return rows;
}

export function getAllProductsForAdmin(): Product[] {
  const rows = db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p JOIN categories c ON c.id = p.category_id
       ORDER BY p.created_at DESC`
    )
    .all() as any[];
  return rows.map(parseProductRow);
}

export function getAllVariantsForAdmin(): (ProductVariant & { product_name: string; product_slug: string; category_name: string })[] {
  return db
    .prepare(
      `SELECT v.*, p.name as product_name, p.slug as product_slug, c.name as category_name
       FROM product_variants v
       JOIN products p ON p.id = v.product_id
       JOIN categories c ON c.id = p.category_id
       ORDER BY p.name ASC, v.size ASC, v.color ASC`
    )
    .all() as any[];
}

export function recomputeProductRating(productId: string): void {
  const row = db
    .prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE product_id = ? AND is_approved = 1')
    .get(productId) as { avg: number | null; count: number };
  db.prepare('UPDATE products SET rating_avg = ?, rating_count = ? WHERE id = ?').run(
    row.avg ? Math.round(row.avg * 10) / 10 : 0,
    row.count,
    productId
  );
}
