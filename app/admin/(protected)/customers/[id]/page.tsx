import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUserById } from '@/lib/models/users';
import { getOrdersForUser } from '@/lib/models/orders';
import { formatDate, formatDateTime, formatINR, statusBadgeClasses } from '@/lib/utils';

export const metadata = { title: 'Admin — Customer Detail' };

export default function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = getUserById(params.id);
  if (!customer || customer.role !== 'customer') notFound();
  const orders = getOrdersForUser(customer.id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="border border-sandline bg-bone p-6">
        <h1 className="font-display text-2xl font-black">{customer.name}</h1>
        <p className="mt-1 text-sm text-ink/60">{customer.email} {customer.phone && `· ${customer.phone}`}</p>
        <p className="mt-1 text-xs text-ink/40">Joined {formatDate(customer.created_at)}</p>
        <span className={`mt-3 inline-block border px-2 py-0.5 text-xs font-semibold ${customer.status === 'active' ? 'border-okgreen/30 bg-okgreen/10 text-okgreen' : 'border-clay/30 bg-clay/10 text-clay'}`}>
          {customer.status === 'active' ? 'Active' : 'Deactivated'}
        </span>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Order History</h2>
        {orders.length === 0 ? (
          <p className="border border-dashed border-sandline p-6 text-center text-sm text-ink/50">No orders yet.</p>
        ) : (
          <div className="divide-y divide-sandline border border-sandline bg-bone">
            {orders.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between p-4 text-sm hover:bg-sand/30">
                <div>
                  <p className="font-mono font-semibold">{o.order_number}</p>
                  <p className="text-xs text-ink/50">{formatDateTime(o.created_at)}</p>
                </div>
                <span className={`border px-2 py-0.5 text-xs font-semibold ${statusBadgeClasses(o.status)}`}>{o.status}</span>
                <p className="font-mono">{formatINR(o.total_amount)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
