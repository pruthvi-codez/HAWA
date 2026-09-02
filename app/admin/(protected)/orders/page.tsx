import Link from 'next/link';
import { listOrdersForAdmin } from '@/lib/models/orders';
import { formatDateTime, formatINR, statusBadgeClasses } from '@/lib/utils';
import OrdersFilterBar from '@/components/admin/OrdersFilterBar';
import Pagination from '@/components/Pagination';

export const metadata = { title: 'Admin — Orders' };

export default function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; page?: string };
}) {
  const result = listOrdersForAdmin({
    status: searchParams.status as any,
    search: searchParams.search,
    page: Number(searchParams.page) || 1,
    pageSize: 20,
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">Orders</h1>
      <OrdersFilterBar />

      <div className="overflow-x-auto border border-sandline bg-bone">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sandline text-xs uppercase text-ink/50">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {result.orders.map((o) => (
              <tr key={o.id} className="border-b border-sandline/60 hover:bg-sand/30">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold hover:text-indigo">{o.order_number}</Link>
                </td>
                <td className="p-3">{o.shipping_name}<br /><span className="text-xs text-ink/50">{o.shipping_phone}</span></td>
                <td className="p-3 text-ink/60">{formatDateTime(o.created_at)}</td>
                <td className="p-3">{o.payment_method}<br /><span className="text-xs text-ink/50">{o.payment_status}</span></td>
                <td className="p-3">
                  <span className={`border px-2 py-0.5 text-xs font-semibold ${statusBadgeClasses(o.status)}`}>{o.status}</span>
                </td>
                <td className="p-3 font-mono">{formatINR(o.total_amount)}</td>
              </tr>
            ))}
            {result.orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-ink/50">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} totalPages={result.totalPages} />
    </div>
  );
}
