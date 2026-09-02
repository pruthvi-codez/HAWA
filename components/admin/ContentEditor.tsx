'use client';

import { useState } from 'react';
import type { FAQItem, Testimonial } from '@/lib/settings-defaults';

interface ContentValues {
  store_name: string;
  store_tagline: string;
  hero_headline: string;
  hero_subtext: string;
  hero_cta_label: string;
  about_content: string;
  contact_content: string;
  shipping_policy: string;
  returns_policy: string;
  privacy_policy: string;
  terms_content: string;
  faqs: FAQItem[];
  testimonials: Testimonial[];
}

export default function ContentEditor({ initial }: { initial: ContentValues }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof ContentValues>(key: K, value: ContentValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  function updateFaq(i: number, field: keyof FAQItem, value: string) {
    const next = [...values.faqs];
    next[i] = { ...next[i], [field]: value };
    set('faqs', next);
  }

  function updateTestimonial(i: number, field: keyof Testimonial, value: string | number) {
    const next = [...values.testimonials];
    next[i] = { ...next[i], [field]: value } as Testimonial;
    set('testimonials', next);
  }

  return (
    <div className="max-w-3xl space-y-8 pb-24">
      <Section title="Store Identity">
        <Field label="Store name" value={values.store_name} onChange={(v) => set('store_name', v)} />
        <Field label="Tagline" value={values.store_tagline} onChange={(v) => set('store_tagline', v)} />
      </Section>

      <Section title="Homepage Hero Banner">
        <Field label="Headline" value={values.hero_headline} onChange={(v) => set('hero_headline', v)} textarea />
        <Field label="Subtext" value={values.hero_subtext} onChange={(v) => set('hero_subtext', v)} textarea />
        <Field label="Button label" value={values.hero_cta_label} onChange={(v) => set('hero_cta_label', v)} />
      </Section>

      <Section title="About Page">
        <Field label="Content (blank line = new paragraph)" value={values.about_content} onChange={(v) => set('about_content', v)} textarea rows={6} />
      </Section>

      <Section title="Contact Page Intro">
        <Field label="Content" value={values.contact_content} onChange={(v) => set('contact_content', v)} textarea rows={3} />
      </Section>

      <Section title="Shipping Policy">
        <Field label="Content" value={values.shipping_policy} onChange={(v) => set('shipping_policy', v)} textarea rows={6} />
      </Section>

      <Section title="Returns & Exchange Policy">
        <Field label="Content" value={values.returns_policy} onChange={(v) => set('returns_policy', v)} textarea rows={6} />
      </Section>

      <Section title="Privacy Policy">
        <Field label="Content" value={values.privacy_policy} onChange={(v) => set('privacy_policy', v)} textarea rows={6} />
      </Section>

      <Section title="Terms & Conditions">
        <Field label="Content" value={values.terms_content} onChange={(v) => set('terms_content', v)} textarea rows={6} />
      </Section>

      <Section title="FAQs">
        <div className="space-y-4">
          {values.faqs.map((f, i) => (
            <div key={i} className="border border-sandline p-3">
              <input value={f.q} onChange={(e) => updateFaq(i, 'q', e.target.value)} placeholder="Question" className="input mb-2" />
              <textarea value={f.a} onChange={(e) => updateFaq(i, 'a', e.target.value)} placeholder="Answer" rows={2} className="input" />
              <button onClick={() => set('faqs', values.faqs.filter((_, idx) => idx !== i))} className="mt-2 text-xs font-semibold uppercase text-clay hover:underline">
                Remove
              </button>
            </div>
          ))}
          <button onClick={() => set('faqs', [...values.faqs, { q: '', a: '' }])} className="btn-secondary !py-2 text-xs">
            + Add FAQ
          </button>
        </div>
      </Section>

      <Section title="Testimonials">
        <div className="space-y-4">
          {values.testimonials.map((t, i) => (
            <div key={i} className="grid gap-2 border border-sandline p-3 sm:grid-cols-[1fr_80px]">
              <input value={t.name} onChange={(e) => updateTestimonial(i, 'name', e.target.value)} placeholder="Name, City" className="input" />
              <input
                type="number"
                min={1}
                max={5}
                value={t.rating}
                onChange={(e) => updateTestimonial(i, 'rating', Number(e.target.value))}
                className="input"
              />
              <textarea
                value={t.quote}
                onChange={(e) => updateTestimonial(i, 'quote', e.target.value)}
                placeholder="Quote"
                rows={2}
                className="input sm:col-span-2"
              />
              <button
                onClick={() => set('testimonials', values.testimonials.filter((_, idx) => idx !== i))}
                className="text-xs font-semibold uppercase text-clay hover:underline sm:col-span-2"
              >
                Remove
              </button>
            </div>
          ))}
          <button onClick={() => set('testimonials', [...values.testimonials, { name: '', quote: '', rating: 5 }])} className="btn-secondary !py-2 text-xs">
            + Add Testimonial
          </button>
        </div>
      </Section>

      <div className="flex items-center gap-4 border-t border-sandline bg-bone pt-4">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save All Content'}
        </button>
        {saved && <span className="text-xs font-semibold text-okgreen">Saved.</span>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-sandline bg-bone p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="input" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="input" />
      )}
    </div>
  );
}
