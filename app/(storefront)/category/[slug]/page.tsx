import { notFound } from 'next/navigation';
import ShopPageContent, { ShopSearchParams } from '@/components/ShopPageContent';
import { getCategoryBySlug } from '@/lib/models/categories';

export function generateMetadata({ params }: { params: { slug: string } }) {
  const category = getCategoryBySlug(params.slug);
  return { title: category ? category.name : 'Category' };
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: ShopSearchParams;
}) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();

  return <ShopPageContent categorySlug={category.slug} heading={category.name} searchParams={searchParams} />;
}
