import { getAllCoupons } from '@/lib/models/coupons';
import CouponsManager from '@/components/admin/CouponsManager';

export const metadata = { title: 'Admin — Coupons' };

export default function AdminCouponsPage() {
  const coupons = getAllCoupons();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">Coupons</h1>
      <CouponsManager initialCoupons={coupons} />
    </div>
  );
}
