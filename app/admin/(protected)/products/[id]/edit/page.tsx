import { notFound } from 'next/navigation';
import { getAllCategories } from '@/lib/models/categories';
import { getProductById } from '@/lib/models/products';
import ProductForm from '@/components/admin/ProductForm';

export const metadata = { title: 'Admin — Edit Product' };

export default function EditProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);
  if (!product) notFound();
  const categories = getAllCategories();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">Edit Product</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
