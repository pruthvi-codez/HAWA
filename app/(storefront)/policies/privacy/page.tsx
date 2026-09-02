import ContentPage from '@/components/ContentPage';
import { getSettings } from '@/lib/models/settings';
import { CONTENT_DEFAULTS } from '@/lib/settings-defaults';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPolicyPage() {
  const content = getSettings({ privacy_policy: CONTENT_DEFAULTS.privacy_policy });
  return <ContentPage title="Privacy Policy" body={content.privacy_policy} />;
}
