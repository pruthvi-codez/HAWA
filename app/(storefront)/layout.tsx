import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllCategories } from '@/lib/models/categories';
import { getSettings } from '@/lib/models/settings';
import { CONTENT_DEFAULTS } from '@/lib/settings-defaults';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const categories = getAllCategories();
  const content = getSettings({ store_name: CONTENT_DEFAULTS.store_name });

  return (
    <>
      <Header categories={categories} storeName={content.store_name} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
