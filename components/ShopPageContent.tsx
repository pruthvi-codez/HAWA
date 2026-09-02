import { listProducts } from '@/lib/models/products';
import { attachVariants } from '@/lib/models/products';
import { getAllCategories } from '@/lib/models/categories';
import { getSession } from '@/lib/auth';
import { isInWishlist } from '@/lib/models/wishlist';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import SortDropdown from '@/components/SortDropdown';
import Pagination from '@/components/Pagination';

export interface ShopSearchParams {
  search?: string;
  size?: string | string[];
  color?: string | string[];
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
}

function toArray(v?: string | string[]): string[] | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v : [v];
}

export default async function ShopPageContent({
  categorySlug,
  searchParams,
  heading,
  description,
}: {
  categorySlug?: string;
  searchParams: ShopSearchParams;
  heading: string;
  description?: string;
}) {
  const page = Number(searchParams.page) || 1;
  const sort = (searchParams.sort as any) || 'newest';

  const result = listProducts({
    categorySlug,
    search: searchParams.search,
    sizes: toArray(searchParams.size),
    colors: toArray(searchParams.color),
    minPrice: searchParams.min ? Number(searchParams.min) : undefined,
    maxPrice: searchParams.max ? Number(searchParams.max) : undefined,
    sort,
    page,
    pageSize: 12,
  });

  const products = result.products.map(attachVariants);
  const categories = getAllCategories().map((c) => ({ name: c.name, slug: c.slug }));

  const session = await getSession();
  const wishlistedSet = new Set<string>();
  if (session) {
    for (const p of products) {
      if (isInWishlist(session.sub, p.id)) wishlistedSet.add(p.id);
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">{heading}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-ink/60">{description}</p>}
        {searchParams.search && (
          <p className="mt-2 text-sm text-ink/60">
            {result.total} result{result.total !== 1 ? 's' : ''} for &ldquo;{searchParams.search}&rdquo;
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <FilterSidebar categories={categories} />

        <div>
          <div className="mb-6 flex items-center justify-between border-b border-sandline pb-4">
            <p className="text-sm text-ink/60">{result.total} products</p>
            <SortDropdown />
          </div>

          {products.length === 0 ? (
            <div className="border border-dashed border-sandline py-24 text-center">
              <p className="text-sm text-ink/60">No products match those filters.</p>
              <a href={categorySlug ? `/category/${categorySlug}` : '/shop'} className="mt-3 inline-block text-sm font-semibold text-indigo hover:underline">
                Clear filters
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} initialWishlisted={wishlistedSet.has(p.id)} />
              ))}
            </div>
          )}

          <Pagination page={result.page} totalPages={result.totalPages} />
        </div>
      </div>
    </div>
  );
}
