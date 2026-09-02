import ContentPage from '@/components/ContentPage';
import { getSettings } from '@/lib/models/settings';
import { CONTENT_DEFAULTS } from '@/lib/settings-defaults';

export const metadata = { title: 'About Us' };

export default function AboutPage() {
  const content = getSettings({ about_content: CONTENT_DEFAULTS.about_content, store_name: CONTENT_DEFAULTS.store_name });
  return <ContentPage title={`About ${content.store_name}`} body={content.about_content} />;
}
