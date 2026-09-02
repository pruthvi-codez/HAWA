'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    return `${pathname}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`btn-secondary !px-4 !py-2 text-xs ${page === 1 ? 'pointer-events-none opacity-30' : ''}`}
      >
        Prev
      </Link>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="text-ink/30">…</span>}
          <Link
            href={hrefFor(p)}
            className={`flex h-9 w-9 items-center justify-center border text-sm ${
              p === page ? 'border-ink bg-ink text-bone' : 'border-sandline hover:border-ink'
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`btn-secondary !px-4 !py-2 text-xs ${page === totalPages ? 'pointer-events-none opacity-30' : ''}`}
      >
        Next
      </Link>
    </nav>
  );
}
