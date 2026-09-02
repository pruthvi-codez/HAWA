import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getOrdersForUser } from '@/lib/models/orders';
import { formatDate, formatINR, statusBadgeClasses } from '@/lib/utils';

export const metadata = { title: 'Order History' };

export default async function OrderHistoryPage() {
  const session = await getSession();
  const orders = getOrdersForUser(session!.sub);

  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-sandline py-16 text-center">
        <p className="text-sm text-ink/60">You haven&rsquo;t placed any orders yet.</p>
        <Link href="/shop" className="btn-primary mt-4 inline-flex">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-sandline border border-sandline">
      {orders.map((o) => (
        <Link key={o.id} href={`/account/orders/${o.order_number}`} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm hover:bg-sand/40">
          <div>
            <p className="font-mono font-semibold">{o.order_number}</p>
            <p className="text-xs text-ink/50">{formatDate(o.created_at)} · {o.items?.length} item{(o.items?.length || 0) !== 1 ? 's' : ''}</p>
          </div>
          <span className={`border px-2 py-1 text-xs font-semibold ${statusBadgeClasses(o.status)}`}>{o.status}</span>
          <p className="font-mono">{formatINR(o.total_amount)}</p>
        </Link>
      ))}
    </div>
  );
}
