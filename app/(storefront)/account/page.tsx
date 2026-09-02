import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getOrdersForUser } from '@/lib/models/orders';
import { getWishlistProducts } from '@/lib/models/wishlist';
import { formatDate, formatINR, statusBadgeClasses } from '@/lib/utils';

export const metadata = { title: 'Account Overview' };

export default async function AccountOverviewPage() {
  const session = await getSession();
  const orders = getOrdersForUser(session!.sub);
  const wishlist = getWishlistProducts(session!.sub);
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="border border-sandline p-6">
        <p className="text-sm text-ink/60">Welcome back,</p>
        <p className="font-display text-2xl font-black">{session!.name}</p>
        <p className="mt-1 text-sm text-ink/50">{session!.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-sandline p-5">
          <p className="eyebrow">Total Orders</p>
          <p className="mt-2 font-display text-3xl font-black">{orders.length}</p>
        </div>
        <div className="border border-sandline p-5">
          <p className="eyebrow">Wishlist Items</p>
          <p className="mt-2 font-display text-3xl font-black">{wishlist.length}</p>
        </div>
        <div className="border border-sandline p-5">
          <p className="eyebrow">Total Spent</p>
          <p className="mt-2 font-display text-3xl font-black">{formatINR(orders.reduce((s, o) => s + o.total_amount, 0))}</p>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs font-semibold text-indigo hover:underline">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="border border-dashed border-sandline p-6 text-center text-sm text-ink/50">No orders yet.</p>
        ) : (
          <div className="divide-y divide-sandline border border-sandline">
            {recentOrders.map((o) => (
              <Link key={o.id} href={`/account/orders/${o.order_number}`} className="flex items-center justify-between p-4 text-sm hover:bg-sand/40">
                <div>
                  <p className="font-mono font-semibold">{o.order_number}</p>
                  <p className="text-xs text-ink/50">{formatDate(o.created_at)}</p>
                </div>
                <span className={`border px-2 py-1 text-xs font-semibold ${statusBadgeClasses(o.status)}`}>{o.status}</span>
                <p className="font-mono">{formatINR(o.total_amount)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
