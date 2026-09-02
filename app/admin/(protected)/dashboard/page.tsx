import Link from 'next/link';
import { getDashboardStats } from '@/lib/models/reports';
import { formatDateTime, formatINR, statusBadgeClasses } from '@/lib/utils';

export const metadata = { title: 'Admin Dashboard' };

export default function AdminDashboardPage() {
  const stats = getDashboardStats();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sales" value={formatINR(stats.totalSales)} />
        <StatCard label="Today's Orders" value={String(stats.todayOrders)} />
        <StatCard label="Monthly Revenue" value={formatINR(stats.monthlyRevenue)} />
        <StatCard label="New Customers (30d)" value={String(stats.newCustomers30d)} sub={`${stats.totalCustomers} total`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.statusCounts.map((s) => (
          <div key={s.status} className="border border-sandline bg-bone p-4">
            <p className={`inline-block border px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClasses(s.status)}`}>{s.status}</p>
            <p className="mt-2 font-display text-2xl font-black">{s.count}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-sandline bg-bone p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Low Stock</h2>
            <Link href="/admin/inventory" className="text-xs font-semibold text-indigo hover:underline">Manage →</Link>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-ink/50">Nothing low on stock.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {stats.lowStock.map((v: any) => (
                <div key={v.id} className="flex items-center justify-between border-b border-sandline pb-2">
                  <span>{v.product_name} <span className="text-ink/40">({v.size}/{v.color})</span></span>
                  <span className={`font-mono font-semibold ${v.stock === 0 ? 'text-clay' : 'text-ink'}`}>{v.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-sandline bg-bone p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Top Selling Products</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-ink/50">No sales yet.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {stats.topProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between border-b border-sandline pb-2">
                  <span>{p.name}</span>
                  <span className="font-mono text-ink/60">{p.sold_count} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-sandline bg-bone p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-semibold text-indigo hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sandline text-xs uppercase text-ink/50">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {(stats.recentOrders as any[]).map((o) => (
                <tr key={o.id} className="border-b border-sandline/60">
                  <td className="py-2 pr-4">
                    <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold hover:text-indigo">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-ink/60">{formatDateTime(o.created_at)}</td>
                  <td className="py-2 pr-4">
                    <span className={`border px-2 py-0.5 text-xs font-semibold ${statusBadgeClasses(o.status)}`}>{o.status}</span>
                  </td>
                  <td className="py-2 pr-4 font-mono">{formatINR(o.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-sandline bg-bone p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-display text-2xl font-black">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink/50">{sub}</p>}
    </div>
  );
}
