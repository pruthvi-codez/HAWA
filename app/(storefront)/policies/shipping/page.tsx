import ContentPage from '@/components/ContentPage';
import { getSettings } from '@/lib/models/settings';
import { CONTENT_DEFAULTS } from '@/lib/settings-defaults';

export const metadata = { title: 'Shipping Policy' };

export default function ShippingPolicyPage() {
  const content = getSettings({ shipping_policy: CONTENT_DEFAULTS.shipping_policy });
  return <ContentPage title="Shipping Policy" body={content.shipping_policy} />;
}
