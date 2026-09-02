import ContentPage from '@/components/ContentPage';
import { getSettings } from '@/lib/models/settings';
import { CONTENT_DEFAULTS } from '@/lib/settings-defaults';

export const metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  const content = getSettings({ terms_content: CONTENT_DEFAULTS.terms_content });
  return <ContentPage title="Terms & Conditions" body={content.terms_content} />;
}
