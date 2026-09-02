import { getAllVariantsForAdmin } from '@/lib/models/products';
import InventoryTable from '@/components/admin/InventoryTable';

export const metadata = { title: 'Admin — Inventory' };

export default function AdminInventoryPage() {
  const variants = getAllVariantsForAdmin();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">Inventory</h1>
      <InventoryTable initialVariants={variants} />
    </div>
  );
}
