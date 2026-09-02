import { getSalesByDay, getSalesByCategory, getTopProductsReport } from '@/lib/models/reports';
import { formatDate, formatINR } from '@/lib/utils';

export const metadata = { title: 'Admin — Reports' };

export default function AdminReportsPage() {
  const salesByDay = getSalesByDay(14);
  const salesByCategory = getSalesByCategory();
  const topProducts = getTopProductsReport(10);
  const maxDayRevenue = Math.max(1, ...salesByDay.map((d) => d.revenue));

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-black uppercase tracking-tight">Reports</h1>
        <a href="/api/admin/reports/export" className="btn-secondary !py-2 text-xs">
          Export Orders (CSV)
        </a>
      </div>

      <div className="border border-sandline bg-bone p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Sales — Last 14 Days</h2>
        {salesByDay.length === 0 ? (
          <p className="text-sm text-ink/50">No orders in this period.</p>
        ) : (
          <div className="space-y-2">
            {salesByDay.map((d) => (
              <div key={d.day} className="flex items-center gap-3 text-xs">
                <span className="w-20 shrink-0 font-mono text-ink/50">{formatDate(d.day)}</span>
                <div className="h-4 flex-1 bg-sand">
                  <div className="h-4 bg-indigo" style={{ width: `${(d.revenue / maxDayRevenue) * 100}%` }} />
                </div>
                <span className="w-24 shrink-0 text-right font-mono">{formatINR(d.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="border border-sandline bg-bone p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Sales by Category</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sandline text-xs uppercase text-ink/50">
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Units</th>
                <th className="py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesByCategory.map((c) => (
                <tr key={c.category} className="border-b border-sandline/60">
                  <td className="py-2">{c.category}</td>
                  <td className="py-2 text-right font-mono">{c.units || 0}</td>
                  <td className="py-2 text-right font-mono">{formatINR(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border border-sandline bg-bone p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">Top Products</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sandline text-xs uppercase text-ink/50">
                <th className="py-2">Product</th>
                <th className="py-2 text-right">Sold</th>
                <th className="py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.slug} className="border-b border-sandline/60">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2 text-right font-mono">{p.sold_count}</td>
                  <td className="py-2 text-right font-mono">{formatINR(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
