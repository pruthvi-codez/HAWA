import { attachVariants, getAllProductsForAdmin } from '@/lib/models/products';
import AdminProductsTable from '@/components/admin/AdminProductsTable';

export const metadata = { title: 'Admin — Products' };

export default function AdminProductsPage() {
  const products = getAllProductsForAdmin().map(attachVariants);
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">Products</h1>
      <AdminProductsTable initialProducts={products} />
    </div>
  );
}
