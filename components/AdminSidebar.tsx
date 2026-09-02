'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/reports', label: 'Reports' },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-bone/10 bg-ink text-bone">
      <div className="border-b border-bone/10 px-5 py-5">
        <p className="font-display text-lg font-black uppercase">HAWA Admin</p>
        <p className="mt-0.5 truncate text-xs text-bone/50">{adminName}</p>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {LINKS.map((l) => {
          const active = pathname === l.href || (l.href !== '/admin/dashboard' && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'block px-3 py-2.5 text-sm font-semibold uppercase tracking-wide',
                active ? 'bg-bone text-ink' : 'text-bone/70 hover:bg-bone/10 hover:text-bone'
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-bone/10 p-2">
        <button onClick={logout} className="block w-full px-3 py-2.5 text-left text-sm font-semibold uppercase tracking-wide text-bone/70 hover:bg-bone/10 hover:text-bone">
          Log Out
        </button>
        <Link href="/" className="block px-3 py-2.5 text-left text-sm font-semibold uppercase tracking-wide text-bone/50 hover:bg-bone/10 hover:text-bone">
          ← View Store
        </Link>
      </div>
    </aside>
  );
}
