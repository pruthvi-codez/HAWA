import Link from 'next/link';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

export default function ProductSection({
  eyebrow,
  title,
  viewAllHref,
  products,
  wishlistedIds,
}: {
  eyebrow: string;
  title: string;
  viewAllHref: string;
  products: Product[];
  wishlistedIds: Set<string>;
}) {
  if (products.length === 0) return null;

  return (
    <section className="container-page py-14">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-1 font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">{title}</h2>
        </div>
        <Link href={viewAllHref} className="hidden text-sm font-semibold uppercase tracking-wide text-indigo hover:underline sm:block">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} initialWishlisted={wishlistedIds.has(p.id)} />
        ))}
      </div>
      <Link href={viewAllHref} className="mt-8 block text-center text-sm font-semibold uppercase tracking-wide text-indigo hover:underline sm:hidden">
        View all →
      </Link>
    </section>
  );
}
