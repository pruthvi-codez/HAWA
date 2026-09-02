import { notFound } from 'next/navigation';
import Link from 'next/link';
import { attachVariants, getProductBySlug, getRelatedProducts } from '@/lib/models/products';
import { getApprovedReviewsForProduct } from '@/lib/models/reviews';
import { getSession } from '@/lib/auth';
import { isInWishlist } from '@/lib/models/wishlist';
import ProductGallery from '@/components/ProductGallery';
import AddToCartControls from '@/components/AddToCartControls';
import ReviewsSection from '@/components/ReviewsSection';
import ProductCard from '@/components/ProductCard';
import { getSettings } from '@/lib/models/settings';
import { SHIPPING_SETTINGS_DEFAULTS } from '@/lib/settings-defaults';

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  return { title: product ? product.name : 'Product' };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const productRaw = getProductBySlug(params.slug);
  if (!productRaw || !productRaw.is_published) notFound();
  const product = attachVariants(productRaw);

  const reviews = getApprovedReviewsForProduct(product.id);
  const related = getRelatedProducts(product, 4).map(attachVariants);
  const shipping = getSettings(SHIPPING_SETTINGS_DEFAULTS);

  const session = await getSession();
  const wishlisted = session ? isInWishlist(session.sub, product.id) : false;

  return (
    <div className="container-page py-10">
      <nav className="mb-6 flex gap-2 text-xs text-ink/50">
        <Link href="/" className="hover:text-ink">Home</Link> /
        <Link href={`/category/${product.category_slug}`} className="hover:text-ink">{product.category_name}</Link> /
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <p className="eyebrow">{product.category_name}</p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight">{product.name}</h1>
          <div className="mt-3 flex items-baseline gap-3 font-mono">
            <span className="text-2xl font-semibold">
              ₹{(product.discount_price ?? product.base_price).toLocaleString('en-IN')}
            </span>
            {product.discount_price && (
              <span className="text-sm text-ink/40 line-through">₹{product.base_price.toLocaleString('en-IN')}</span>
            )}
            <span className="text-xs text-ink/40">incl. of taxes</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink/70">{product.description}</p>

          <div className="stitch-divider my-6 text-sandline" />

          <AddToCartControls product={product} />

          <div className="mt-8 border-t border-sandline pt-6 text-sm text-ink/70">
            <div className="mb-2 flex items-start gap-2">
              <TruckIcon />
              <span>
                Delivery in {shipping.standard_days.toLowerCase()} · ₹{shipping.standard_charge} standard shipping, free over ₹
                {shipping.free_shipping_threshold}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ReturnIcon />
              <span>14-day free size exchange · Easy returns — see our <Link href="/policies/returns" className="underline">Returns Policy</Link></span>
            </div>
          </div>

          <details className="mt-8 border-t border-sandline pt-4 text-sm" open>
            <summary className="cursor-pointer font-semibold uppercase tracking-wide">Material &amp; Care</summary>
            <p className="mt-3 text-ink/70">{product.material}</p>
            <p className="mt-2 text-ink/70">{product.care_instructions}</p>
          </details>
        </div>
      </div>

      <div className="stitch-divider my-16 text-sandline" />

      <ReviewsSection productId={product.id} reviews={reviews} ratingAvg={product.rating_avg} ratingCount={product.rating_count} />

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} initialWishlisted={session ? isInWishlist(session.sub, p.id) : false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mt-0.5 shrink-0">
      <path d="M3 7h11v9H3z" strokeLinejoin="round" />
      <path d="M14 10h4l3 3v3h-7z" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}
function ReturnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mt-0.5 shrink-0">
      <path d="M4 12a8 8 0 1 0 3-6.2" strokeLinecap="round" />
      <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
