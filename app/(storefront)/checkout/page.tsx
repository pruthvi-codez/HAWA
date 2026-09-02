import { getSession } from '@/lib/auth';
import { getAddressesForUser } from '@/lib/models/addresses';
import { getSettings } from '@/lib/models/settings';
import { SHIPPING_SETTINGS_DEFAULTS, PAYMENT_SETTINGS_DEFAULTS } from '@/lib/settings-defaults';
import CheckoutClient from '@/components/CheckoutClient';

export const metadata = { title: 'Checkout' };

export default async function CheckoutPage({ searchParams }: { searchParams: { coupon?: string } }) {
  const session = await getSession();
  const addresses = session ? getAddressesForUser(session.sub) : [];
  const shipping = getSettings(SHIPPING_SETTINGS_DEFAULTS);
  const payment = getSettings(PAYMENT_SETTINGS_DEFAULTS);

  return (
    <CheckoutClient
      isLoggedIn={!!session}
      addresses={addresses}
      shipping={shipping}
      payment={payment}
      initialCoupon={searchParams.coupon || ''}
    />
  );
}
