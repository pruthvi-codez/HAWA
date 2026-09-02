import { Suspense } from 'react';
import ContactForm from '@/components/ContactForm';
import { getSettings } from '@/lib/models/settings';
import { STORE_SETTINGS_DEFAULTS, CONTENT_DEFAULTS } from '@/lib/settings-defaults';

export const metadata = { title: 'Contact Us' };

export default function ContactPage() {
  const settings = getSettings(STORE_SETTINGS_DEFAULTS);
  const content = getSettings({ contact_content: CONTENT_DEFAULTS.contact_content, faqs: CONTENT_DEFAULTS.faqs });

  return (
    <div className="container-page py-14">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight">Contact Us</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">{content.contact_content}</p>
          <div className="mt-8 space-y-3 text-sm">
            <p><span className="text-ink/50">Email:</span> {settings.contact_email}</p>
            <p><span className="text-ink/50">Phone:</span> {settings.contact_phone}</p>
            <p><span className="text-ink/50">Studio:</span> {settings.contact_address}</p>
          </div>
        </div>
        <Suspense fallback={null}>
          <ContactForm />
        </Suspense>
      </div>

      <div className="mt-16 max-w-2xl">
        <h2 className="mb-6 font-display text-2xl font-black uppercase tracking-tight">Frequently Asked</h2>
        <div className="divide-y divide-sandline border-t border-sandline">
          {content.faqs.map((f, i) => (
            <details key={i} className="group py-4">
              <summary className="cursor-pointer list-none text-sm font-semibold">
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-ink/60">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
