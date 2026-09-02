'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'Order History' },
  { href: '/account/addresses', label: 'Saved Addresses' },
  { href: '/account/wishlist', label: 'Wishlist' },
  { href: '/account/profile', label: 'Profile Settings' },
];

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="flex flex-col gap-1 border border-sandline p-2 sm:p-4">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            'px-3 py-2.5 text-sm font-semibold uppercase tracking-wide',
            pathname === l.href ? 'bg-ink text-bone' : 'text-ink hover:bg-sand'
          )}
        >
          {l.label}
        </Link>
      ))}
      <button onClick={logout} className="mt-2 border-t border-sandline px-3 py-2.5 text-left text-sm font-semibold uppercase tracking-wide text-clay hover:bg-sand">
        Log Out
      </button>
    </nav>
  );
}
