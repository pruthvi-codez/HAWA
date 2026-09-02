import Link from 'next/link';
import Image from 'next/image';
import { attachVariants, listProducts } from '@/lib/models/products';
import { getAllCategories } from '@/lib/models/categories';
import { getSession } from '@/lib/auth';
import { isInWishlist } from '@/lib/models/wishlist';
import { getSettings } from '@/lib/models/settings';
import { CONTENT_DEFAULTS } from '@/lib/settings-defaults';
import ProductSection from '@/components/ProductSection';
import StarRating from '@/components/StarRating';
import NewsletterForm from '@/components/NewsletterForm';

const CATEGORY_IMAGE_SEED: Record<string, string> = {
  men: 'cat-men',
  women: 'cat-women',
  't-shirts': 'crew-tee-0',
  shirts: 'linen-shirt-0',
  jeans: 'straight-jeans-0',
  hoodies: 'fleece-hoodie-0',
  dresses: 'wrap-dress-0',
};

export default async function HomePage() {
  const content = getSettings({
    hero_headline: CONTENT_DEFAULTS.hero_headline,
    hero_subtext: CONTENT_DEFAULTS.hero_subtext,
    hero_cta_label: CONTENT_DEFAULTS.hero_cta_label,
    testimonials: CONTENT_DEFAULTS.testimonials,
  });

  const categories = getAllCategories();
  const featured = listProducts({ featuredOnly: true, pageSize: 8, sort: 'newest' }).products.map(attachVariants);
  const newArrivals = listProducts({ sort: 'newest', pageSize: 8 }).products.map(attachVariants);
  const bestSellers = listProducts({ sort: 'popularity', pageSize: 8 }).products.map(attachVariants);

  const session = await getSession();
  const wishlisted = new Set<string>();
  if (session) {
    const all = [...featured, ...newArrivals, ...bestSellers];
    for (const p of all) if (isInWishlist(session.sub, p.id)) wishlisted.add(p.id);
  }

  return (
    <div>
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-ink text-bone">
        <Image
          src="https://picsum.photos/seed/hawa-hero/1800/1200"
          alt=""
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="container-page relative z-10">
          <p className="eyebrow text-bone/70">New Season</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-6xl">
            {content.hero_headline}
          </h1>
          <p className="mt-5 max-w-md text-sm text-bone/80 sm:text-base">{content.hero_subtext}</p>
          <Link href="/shop" className="btn-outline-light mt-8 inline-flex">
            {content.hero_cta_label}
          </Link>
        </div>
      </section>

      <section className="container-page py-14">
        <p className="eyebrow">Shop By</p>
        <h2 className="mt-1 mb-8 font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">Category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="group relative aspect-[3/4] overflow-hidden bg-sand">
              <Image
                src={`https://picsum.photos/seed/${CATEGORY_IMAGE_SEED[c.slug] || c.slug}/600/800`}
                alt={c.name}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 font-display text-lg font-black uppercase text-bone">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <ProductSection eyebrow="Handpicked" title="Featured Products" viewAllHref="/shop" products={featured} wishlistedIds={wishlisted} />

      <div className="stitch-divider container-page text-sandline" />

      <ProductSection eyebrow="Just In" title="New Arrivals" viewAllHref="/shop?sort=newest" products={newArrivals} wishlistedIds={wishlisted} />

      <div className="stitch-divider container-page text-sandline" />

      <ProductSection eyebrow="Fan Favourites" title="Best Sellers" viewAllHref="/shop?sort=popularity" products={bestSellers} wishlistedIds={wishlisted} />

      <section className="bg-sand py-16">
        <div className="container-page">
          <p className="eyebrow">Reviews</p>
          <h2 className="mt-1 mb-8 font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">What customers say</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {content.testimonials.map((t, i) => (
              <div key={i} className="border border-sandline bg-bone p-6">
                <StarRating value={t.rating} size={14} />
                <p className="mt-3 text-sm text-ink/70">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/50">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 text-center">
        <p className="eyebrow">Stay Updated</p>
        <h2 className="mt-1 font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">Join the list</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">New drops, restocks, and the occasional discount. No spam, unsubscribe anytime.</p>
        <div className="mx-auto mt-6 max-w-sm">
          <NewsletterForm variant="light" />
        </div>
      </section>
    </div>
  );
}
