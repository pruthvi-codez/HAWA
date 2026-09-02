import { getSettings } from '@/lib/models/settings';
import { STORE_SETTINGS_DEFAULTS, SHIPPING_SETTINGS_DEFAULTS, PAYMENT_SETTINGS_DEFAULTS } from '@/lib/settings-defaults';
import SettingsEditor from '@/components/admin/SettingsEditor';

export const metadata = { title: 'Admin — Settings' };

export default function AdminSettingsPage() {
  const values = {
    ...getSettings(STORE_SETTINGS_DEFAULTS),
    ...getSettings(SHIPPING_SETTINGS_DEFAULTS),
    ...getSettings(PAYMENT_SETTINGS_DEFAULTS),
  };
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">Settings</h1>
      <SettingsEditor initial={values} />
    </div>
  );
}
