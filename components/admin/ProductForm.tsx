'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, Product } from '@/lib/types';

export default function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const router = useRouter();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.category_id || categories[0]?.id || '');
  const [description, setDescription] = useState(product?.description || '');
  const [basePrice, setBasePrice] = useState(product?.base_price?.toString() || '');
  const [discountPrice, setDiscountPrice] = useState(product?.discount_price?.toString() || '');
  const [images, setImages] = useState((product?.images || []).join('\n'));
  const [sizes, setSizes] = useState((product?.sizes || []).join(', '));
  const [colors, setColors] = useState((product?.colors || []).join(', '));
  const [material, setMaterial] = useState(product?.material || '');
  const [care, setCare] = useState(product?.care_instructions || '');
  const [skuPrefix, setSkuPrefix] = useState(product?.sku_prefix || '');
  const [isFeatured, setIsFeatured] = useState(product?.is_featured || false);
  const [isPublished, setIsPublished] = useState(product?.is_published ?? true);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      name,
      category_id: categoryId,
      description,
      base_price: Number(basePrice),
      discount_price: discountPrice ? Number(discountPrice) : null,
      images: images.split('\n').map((s) => s.trim()).filter(Boolean),
      sizes: sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: colors.split(',').map((s) => s.trim()).filter(Boolean),
      material,
      care_instructions: care,
      sku_prefix: skuPrefix,
      is_featured: isFeatured,
      is_published: isPublished,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save product.');
        setSubmitting(false);
        return;
      }
      router.push('/admin/products');
      router.refresh();
    } catch {
      setError('Network error — please try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Product name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Category</label>
          <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">SKU prefix</label>
          <input required value={skuPrefix} onChange={(e) => setSkuPrefix(e.target.value)} className="input" placeholder="e.g. HW021" />
        </div>
        <div>
          <label className="label">Base price (₹)</label>
          <input required type="number" min={0} value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Discount price (₹, optional)</label>
          <input type="number" min={0} value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Image URLs (one per line)</label>
          <textarea rows={3} value={images} onChange={(e) => setImages(e.target.value)} className="input font-mono text-xs" placeholder="https://..." />
        </div>
        <div>
          <label className="label">Sizes (comma separated)</label>
          <input required value={sizes} onChange={(e) => setSizes(e.target.value)} className="input" placeholder="S, M, L, XL" />
          {isEdit && <p className="mt-1 text-xs text-ink/40">Changing sizes/colours after creation won&rsquo;t remove existing variant stock rows.</p>}
        </div>
        <div>
          <label className="label">Colours (comma separated)</label>
          <input required value={colors} onChange={(e) => setColors(e.target.value)} className="input" placeholder="Black, White" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Material</label>
          <input required value={material} onChange={(e) => setMaterial(e.target.value)} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Care instructions</label>
          <textarea required rows={2} value={care} onChange={(e) => setCare(e.target.value)} className="input" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-ink" />
          Featured product
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="accent-ink" />
          Published (visible in store)
        </label>
      </div>

      {error && <p className="text-xs font-semibold text-clay">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')} className="btn-secondary">
          Cancel
        </button>
      </div>

      {!isEdit && (
        <p className="max-w-lg text-xs text-ink/40">
          New size/colour combinations start at 0 stock — set opening stock from the Inventory page after creating the product.
        </p>
      )}
    </form>
  );
}
