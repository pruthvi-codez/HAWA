# HAWA — Single-Vendor Clothing E-Commerce Store

A complete, working e-commerce site for a fictional Indian clothing brand called **HAWA**
("wear the weather"), built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and a
self-contained SQLite database. No external services are required to run it locally.

Demo data includes 20 products across all 7 categories, an admin account, a customer
account, coupons, and a few sample orders and reviews — see **First login** below.

---

## 1. Requirements

- Node.js 18.18+ (Node 20 LTS recommended)
- npm 9+

No PostgreSQL/MongoDB, no Docker, no external API keys needed for local development.

## 2. Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment file (defaults work out of the box for local dev)
cp .env.example .env

# 3. Seed the database (creates data.db in the project root, with demo
#    products, an admin user, a customer, coupons, and sample orders)
npm run seed

# 4. Start the dev server
npm run dev
```

Visit **http://localhost:3000** for the storefront and **http://localhost:3000/admin/login**
for the admin panel.

To reset all data, stop the server and delete `data.db` (plus `data.db-wal` /
`data.db-journal` if present), then run `npm run seed` again.

### Production build

```bash
npm run build
npm run start
```

`SESSION_SECRET` in `.env` signs login sessions — set it to a long random string before
deploying anywhere real. `DATABASE_FILE` controls where the SQLite file lives (defaults to
`./data.db`); point it at a persistent volume in production, since container filesystems
are often ephemeral.

## 3. First login / creating the first admin user

The seed script already creates one admin account:

- **Admin:** `admin@hawa.example` / `Admin@12345` → log in at `/admin/login`
- **Customer:** `customer@example.com` / `Customer@12345` → log in at `/login`

To create an **additional** admin user (there's no "promote to admin" button in the UI —
that's intentional, so it can't be triggered accidentally or via the API), run this from
the project root:

```bash
npx tsx -e "
import { createUser, getUserByEmail } from './lib/models/users';
import { hashPassword } from './lib/password';

const email = 'you@example.com';
const password = 'ChangeThisPassword123';

if (getUserByEmail(email)) {
  console.log('User already exists');
} else {
  hashPassword(password).then((passwordHash) => {
    createUser({ name: 'Your Name', email, passwordHash, role: 'admin' });
    console.log('Admin user created:', email);
  });
}
"
```

Or sign up as a customer through `/register` and flip that row's `role` column from
`customer` to `admin` directly in `data.db` using any SQLite browser, e.g.
[DB Browser for SQLite](https://sqlitebrowser.org/).

## 4. Project structure

```
app/
  (storefront)/        Customer-facing pages — Header + Footer layout
    page.tsx            Homepage
    shop/, category/    Product listing, filters, sort, pagination
    product/[slug]/     Product detail page
    cart/, checkout/    Cart and checkout flow
    order-confirmation/
    login/, register/, forgot-password/, reset-password/
    account/            Customer account section (orders, addresses, wishlist, profile)
    about/, contact/, policies/
  admin/
    login/              Admin login (outside the protected layout)
    (protected)/        Everything else under /admin — sidebar layout, requires role=admin
      dashboard/ products/ inventory/ orders/ customers/ coupons/ reviews/ content/ settings/ reports/
  api/                  Route handlers backing all of the above
db/
  schema.sql            Full SQLite schema (users, products, variants, orders, etc.)
  index.ts              DB connection singleton (runs schema.sql on first use)
  seed.ts               Demo data
lib/
  models/               Data-access layer — one file per entity
  auth.ts, password.ts  Session (JWT cookie) + password hashing
  apiAuth.ts             requireUser() / requireAdmin() guards for API routes
  settings-defaults.ts  Default copy for homepage/About/policies/etc. (editable via /admin/content)
components/              Shared UI; components/admin/ is admin-only
middleware.ts            Edge middleware protecting /account/* and /admin/* (except /admin/login)
```

## 5. What's fully working

- **Storefront:** home, shop with filter/sort/pagination, category pages, product detail
  with size/colour/stock-aware variants, cart (persisted to `localStorage`), checkout,
  order confirmation, About/Contact/Shipping/Returns/Privacy/Terms pages (all editable from
  `/admin/content`).
- **Accounts:** register/login/logout, forgot/reset password, order history with a status
  tracker, saved addresses (CRUD), wishlist, profile editing, password change, account
  deactivation.
- **Checkout correctness:** stock is validated and decremented, totals and coupon discounts
  are **recomputed server-side** from live product prices (never trusted from the client),
  and the whole order is created inside one DB transaction — a failure partway through
  never leaves stock or totals inconsistent.
- **Admin panel:** dashboard with real aggregated stats, full product CRUD, per-variant
  inventory editing, order management (status, payment status, courier/tracking, print
  invoice), customer list with activate/deactivate, coupon management, review moderation,
  a content editor for all public copy (including FAQs/testimonials), store/shipping/payment
  settings, and reports (sales by day/category, top products, CSV export).
- **Security basics:** bcrypt password hashing, HttpOnly signed session cookies, role checks
  on every admin route (both the page middleware and each API route independently), login
  rate-limiting, Zod input validation on every API route, parameterised SQL everywhere (no
  string-built queries).

## 6. What's simplified (and how you'd replace it)

This is a working reference implementation, not a production deployment. A few things are
intentionally stubbed rather than fully built out, so nothing here quietly pretends to be
more real than it is:

- **Payment gateway:** there is no live Razorpay/Stripe/etc. integration. Choosing any
  non-COD method at checkout marks the order "Paid" immediately (see the note shown on the
  checkout page itself). To go live, replace the payment branch in
  `app/api/orders/route.ts` with a real gateway's order-creation + webhook-confirmation flow.
- **Transactional email:** there's no email provider wired up. "Forgot password" returns the
  reset link directly in the API response instead of emailing it (clearly labeled as
  dev-mode on the Forgot Password page), and order confirmations aren't emailed. Plug in a
  provider like Resend or SendGrid in `app/api/auth/forgot-password/route.ts` and after
  order creation in `app/api/orders/route.ts`.
- **Rate limiting** for login is in-memory (`lib/rateLimit.ts`), which is fine for a single
  process but won't share state across multiple server instances — swap in Redis for a
  multi-instance deployment.
- **Contact form** shows a success message but doesn't send anywhere yet — wire it to email
  or a support inbox in `components/ContactForm.tsx`.
- **Categories** are the 7 fixed categories from the brief (Men, Women, T-Shirts, Shirts,
  Jeans, Hoodies, Dresses) seeded directly into the database; there's no admin UI for
  renaming/adding categories (the data model supports subcategories via `parent_id` if you
  want to extend it, but there's no CRUD screen for it yet).
- **Product images** are placeholder photos from picsum.photos (seeded deterministically per
  product), not real product photography — swap the `images` array on each product (via
  `/admin/products`) for real photo URLs whenever you have them.
- **Returns/exchanges** are logged as a support request via the Contact form rather than a
  full self-service return-authorization workflow with its own status machine.
- **Fonts** use system font stacks rather than the originally-intended Archivo/Inter/IBM
  Plex Mono combo, so the project builds without needing to download fonts from Google
  Fonts at build time. To restore them, swap `tailwind.config.js`'s `fontFamily` block for
  `next/font/google` imports in `app/layout.tsx` once you have general internet access at
  build time.

## 7. Design notes

The brand direction (dark charcoal + bone + warm sand, deep indigo accent, monospace price
tags, stitched-line section dividers) is a nod to Indian indigo-dyeing traditions rather
than a generic template. Swap the tokens in `tailwind.config.js` and the copy in
`lib/settings-defaults.ts` (or just use `/admin/content` and `/admin/settings`) to reskin
it for a different brand.
