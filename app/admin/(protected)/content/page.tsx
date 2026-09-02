import { getSettings } from '@/lib/models/settings';
import { CONTENT_DEFAULTS } from '@/lib/settings-defaults';
import ContentEditor from '@/components/admin/ContentEditor';

export const metadata = { title: 'Admin — Content' };

export default function AdminContentPage() {
  const values = getSettings(CONTENT_DEFAULTS);
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">Content</h1>
      <ContentEditor initial={values} />
    </div>
  );
}
