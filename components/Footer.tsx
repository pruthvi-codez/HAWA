import Link from 'next/link';
import { getSettings } from '@/lib/models/settings';
import { STORE_SETTINGS_DEFAULTS, CONTENT_DEFAULTS } from '@/lib/settings-defaults';
import NewsletterForm from '@/components/NewsletterForm';

export default function Footer() {
  const settings = getSettings(STORE_SETTINGS_DEFAULTS);
  const content = getSettings({ store_name: CONTENT_DEFAULTS.store_name, store_tagline: CONTENT_DEFAULTS.store_tagline });

  return (
    <footer className="border-t border-sandline bg-ink text-bone">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-display text-xl font-black">{content.store_name}</div>
          <p className="mt-3 max-w-xs text-sm text-bone/70">{content.store_tagline} Designed and stocked from Bengaluru, shipped across India.</p>
          <div className="mt-5 flex gap-4 text-bone/70">
            <a href={settings.instagram_url} aria-label="Instagram" className="hover:text-bone">
              <InstagramIcon />
            </a>
            <a href={settings.facebook_url} aria-label="Facebook" className="hover:text-bone">
              <FacebookIcon />
            </a>
            <a href={settings.twitter_url} aria-label="Twitter" className="hover:text-bone">
              <TwitterIcon />
            </a>
          </div>
        </div>

        <div>
          <div className="eyebrow text-bone/50">Quick Links</div>
          <ul className="mt-4 space-y-2 text-sm text-bone/80">
            <li><Link href="/shop" className="hover:text-bone">Shop All</Link></li>
            <li><Link href="/category/men" className="hover:text-bone">Men</Link></li>
            <li><Link href="/category/women" className="hover:text-bone">Women</Link></li>
            <li><Link href="/about" className="hover:text-bone">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-bone">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow text-bone/50">Customer Support</div>
          <ul className="mt-4 space-y-2 text-sm text-bone/80">
            <li><Link href="/policies/shipping" className="hover:text-bone">Shipping Policy</Link></li>
            <li><Link href="/policies/returns" className="hover:text-bone">Returns &amp; Exchange</Link></li>
            <li><Link href="/policies/privacy" className="hover:text-bone">Privacy Policy</Link></li>
            <li><Link href="/policies/terms" className="hover:text-bone">Terms &amp; Conditions</Link></li>
            <li><Link href="/account/orders" className="hover:text-bone">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow text-bone/50">Stay Updated</div>
          <p className="mt-4 text-sm text-bone/70">New drops and restock alerts, no spam.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="stitch-divider text-bone/20" />
      <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-bone/50 sm:flex-row">
        <p>© {new Date().getFullYear()} {content.store_name}. All rights reserved.</p>
        <p className="font-mono">Made in India · Prices in INR</p>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14 9h3V6h-3a3 3 0 0 0-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9Z" strokeLinejoin="round" />
    </svg>
  );
}
function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M21 5.5c-.7.4-1.5.6-2.3.8a3.4 3.4 0 0 0-5.8 3.1A9.6 9.6 0 0 1 6 6.1a3.4 3.4 0 0 0 1 4.6c-.6 0-1.2-.2-1.7-.5v.1c0 1.7 1.2 3 2.8 3.4-.5.1-1 .2-1.6.1a3.4 3.4 0 0 0 3.2 2.4A6.9 6.9 0 0 1 4 17.6a9.7 9.7 0 0 0 5.3 1.6c6.3 0 9.8-5.4 9.8-10v-.5c.7-.5 1.3-1.1 1.8-1.8Z" strokeLinejoin="round" />
    </svg>
  );
}
