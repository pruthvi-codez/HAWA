import { getAllCategories } from '@/lib/models/categories';
import ProductForm from '@/components/admin/ProductForm';

export const metadata = { title: 'Admin — New Product' };

export default function NewProductPage() {
  const categories = getAllCategories();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
