'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useClientSession } from '@/context/SessionContext';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function Header({ categories, storeName }: { categories: Category[]; storeName: string }) {
  const { itemCount } = useCart();
  const session = useClientSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [search, setSearch] = useState('');

  const garmentCategories = categories.filter((c) => !['men', 'women'].includes(c.slug));

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setMobileOpen(false);
    router.push(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}` : '/shop');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-sandline bg-bone/95 backdrop-blur">
      <div className="border-b border-sandline bg-ink py-1.5 text-center text-[11px] font-mono uppercase tracking-widest2 text-bone">
        Free standard shipping over ₹1,499 · Cash on Delivery available
      </div>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <button
          className="p-2 lg:hidden -ml-2"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <BarsIcon />
        </button>

        <Link href="/" className="font-display text-2xl font-black tracking-tight text-ink">
          {storeName}
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <Link href="/" className="text-sm font-semibold uppercase tracking-wide text-ink hover:text-indigo">
            Home
          </Link>
          <Link href="/shop" className="text-sm font-semibold uppercase tracking-wide text-ink hover:text-indigo">
            Shop
          </Link>
          <Link href="/category/men" className="text-sm font-semibold uppercase tracking-wide text-ink hover:text-indigo">
            Men
          </Link>
          <Link href="/category/women" className="text-sm font-semibold uppercase tracking-wide text-ink hover:text-indigo">
            Women
          </Link>
          <div className="relative" onMouseEnter={() => setCategoriesOpen(true)} onMouseLeave={() => setCategoriesOpen(false)}>
            <button className="text-sm font-semibold uppercase tracking-wide text-ink hover:text-indigo">Categories</button>
            {categoriesOpen && (
              <div className="absolute left-1/2 top-full w-48 -translate-x-1/2 border border-sandline bg-bone shadow-lg">
                {garmentCategories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="block px-4 py-2.5 text-sm text-ink hover:bg-sand"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/about" className="text-sm font-semibold uppercase tracking-wide text-ink hover:text-indigo">
            About
          </Link>
          <Link href="/contact" className="text-sm font-semibold uppercase tracking-wide text-ink hover:text-indigo">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <form onSubmit={submitSearch} className="relative hidden md:block">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Search products"
              className="w-40 border border-sandline bg-bone py-2 pl-3 pr-8 text-sm focus:w-56 focus:border-indigo focus:outline-none transition-all"
            />
            <button type="submit" aria-label="Search" className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/60">
              <SearchIcon />
            </button>
          </form>

          <Link
            href={session ? '/account' : '/login'}
            className="hidden p-2 sm:inline-flex"
            aria-label={session ? 'Account' : 'Login'}
          >
            <UserIcon />
          </Link>

          <Link href="/cart" className="relative p-2" aria-label="Cart">
            <BagIcon />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[10px] font-bold text-bone">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-bone p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-xl font-black">{storeName}</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2">
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={submitSearch} className="relative mb-6">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="search"
                placeholder="Search products"
                className="input pr-9"
              />
              <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/60">
                <SearchIcon />
              </button>
            </form>
            <nav className="flex flex-col divide-y divide-sandline text-sm">
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Shop' },
                { href: '/category/men', label: 'Men' },
                { href: '/category/women', label: 'Women' },
                ...garmentCategories.map((c) => ({ href: `/category/${c.slug}`, label: c.name })),
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact Us' },
                { href: session ? '/account' : '/login', label: session ? 'My Account' : 'Login / Register' },
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="py-3 font-semibold uppercase tracking-wide">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function BarsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}
