import { getAllCustomers } from '@/lib/models/users';
import AdminCustomersTable from '@/components/admin/AdminCustomersTable';

export const metadata = { title: 'Admin — Customers' };

export default function AdminCustomersPage() {
  const customers = getAllCustomers();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">Customers</h1>
      <AdminCustomersTable initialCustomers={customers} />
    </div>
  );
}
