import ContentPage from '@/components/ContentPage';
import { getSettings } from '@/lib/models/settings';
import { CONTENT_DEFAULTS } from '@/lib/settings-defaults';

export const metadata = { title: 'Returns & Exchange Policy' };

export default function ReturnsPolicyPage() {
  const content = getSettings({ returns_policy: CONTENT_DEFAULTS.returns_policy });
  return <ContentPage title="Returns & Exchange Policy" body={content.returns_policy} />;
}
