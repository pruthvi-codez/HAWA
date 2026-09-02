import { getSettings } from '@/lib/models/settings';
import { SHIPPING_SETTINGS_DEFAULTS } from '@/lib/settings-defaults';
import CartPageClient from '@/components/CartPageClient';

export const metadata = { title: 'Your Cart' };

export default function CartPage() {
  const shipping = getSettings(SHIPPING_SETTINGS_DEFAULTS);
  return <CartPageClient shipping={shipping} />;
}
