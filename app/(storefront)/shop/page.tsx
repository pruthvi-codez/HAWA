import ShopPageContent, { ShopSearchParams } from '@/components/ShopPageContent';

export const metadata = { title: 'Shop All' };

export default function ShopPage({ searchParams }: { searchParams: ShopSearchParams }) {
  return <ShopPageContent heading="Shop All" description="Every HAWA product, in one place." searchParams={searchParams} />;
}
