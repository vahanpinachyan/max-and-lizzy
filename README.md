# Max & Lizzy — Website & Online Store

A production-ready Next.js storefront for Max & Lizzy, a Yerevan toy store
specializing in educational, wooden, and eco-friendly toys for babies and
preschoolers (ages 0–3 and 3–6). Built as both a local-SEO marketing site and
a functioning ecommerce store with ArCa and Idram checkout.

## Tech stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Prisma + SQLite (dev) / Postgres (production)** for products, stock, and
  promo codes — managed from the built-in `/admin` panel, no code deploy
  needed per change (see "Admin panel & database" below)
- **ArCa (ACBA vPOS)** and **Idram** for payments
- **Trilingual** (English / Armenian / Russian) via a cookie-based locale
  switcher — see "Internationalization" below
- **Local TypeScript/JSON data files** for categories, reviews, testimonials,
  and blog posts, which change rarely enough not to need a database (see
  "Editing content" below)
- **Resend** (optional) for staff new-order notifications, order-status updates, and contact form emails
- Deploys to **Vercel**

## Getting started

**Requirements:** Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local   # then fill in real values, see below
npm run db:migrate           # creates prisma/dev.db (SQLite) locally
npm run db:seed              # loads the 20 sample products, WELCOME5, and your first admin account
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site runs and is
fully browsable without any environment variables — card/Idram checkout will
show a friendly error until `ARCA_USERNAME`/`ARCA_PASSWORD` or
`IDRAM_REC_ACCOUNT`/`IDRAM_SECRET_KEY` are set. Sign in to
[http://localhost:3000/admin/login](http://localhost:3000/admin/login) with
the `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` from your `.env.local`.

Other useful commands:

```bash
npm run build       # production build
npm run start        # run the production build locally
npm run lint          # ESLint
npm run db:migrate   # apply schema changes (prompts for a migration name)
npm run db:seed       # re-run the seed script (safe to re-run — upserts)
npm run db:studio    # opens Prisma Studio, a GUI for browsing/editing the DB directly
```

## Folder structure

```
app/
  (site)/                 The public storefront — its own root layout (Header/
                           Footer/cart/wishlist/welcome-popup), everything a
                           shopper sees: /, /shop, /product/[slug], /cart,
                           /checkout, /about, /visit-us, /contact, /policies,
                           /blog, /wishlist. Route group, so it adds nothing
                           to the URL — /(site)/shop is just /shop.
  admin/                  The admin panel — its own separate root layout, no
                           storefront chrome. admin/login is public;
                           admin/(protected)/* requires a session and shows
                           the sidebar (Dashboard, Orders, Customers,
                           Products, Promo Codes, Staff — the last three are
                           manager-only, see "Admin panel & database" below).
  api/                    Route handlers: checkout, webhook, contact,
                           newsletter, products (client-side wishlist lookup),
                           promo-codes (client-side cart validation)
  sitemap.ts, robots.ts, manifest.ts   SEO infrastructure (top-level, shared)
components/
  admin/                  Product/promo-code/staff forms, bulk-edit table,
                           CSV import form, order status controls,
                           delete-confirm button
  ui/                     Small shared primitives (Button, Badge, StarRating…)
  layout/                 Header, Footer, CartDrawer, WishlistDrawer
  home/, shop/, product/, blog/, contact/, seo/   Feature components
prisma/
  schema.prisma           Products, orders, customers, promo codes, admin
                           users/sessions
  seed.ts                 Loads the 20 sample products + WELCOME5 + first admin
data/                     Categories, reviews, testimonials, blog posts — the
                           content that's still edited as code (see below)
lib/
  db.ts                   Prisma client singleton
  admin/auth.ts            Session creation/verification, password hashing
  admin/permissions.ts     Manager vs. cashier access control for admin pages
                           and Server Actions
  inventory.ts             Low-stock threshold/check, shared by the products
                           page and the sidebar alert banner
  order-emails.ts          Resend order-status email templates
  translate.ts             Google Cloud Translation API wrapper for the
                           product-form auto-translate button
  csv.ts                   Zero-dependency CSV parser for bulk product import
  i18n/                    Locale cookie, dictionaries (en/hy/ru), translation
                           helpers for categories
  cart-context.tsx, use-wishlist.ts   Client-side cart/wishlist state
types/                    Shared TypeScript types (Product, BlogPost, etc.)
scripts/                  One-off script that generated the placeholder SVG images
public/images/            Placeholder product/category/blog/store images
```

## Editing content (no code changes needed beyond editing these files)

Products, stock, and promo codes are now managed from the **`/admin`** panel
(see below) — not by editing files. Everything else still lives in `data/`:

- **`data/site.ts`** — business name, address, phone, email, hours, social
  links, currency, Google Maps embed URL. **This is the first file to update
  before launch** (see checklist below).
- **`data/categories.ts`** — top-level categories and their subcategories.
  Category slugs here must match the `category` field admin sets on
  products. Categories change rarely enough (new ones mean new nav items and
  new translated copy) that they stayed a code file rather than a database
  table — ask if you want these editable from `/admin` too.
- **`data/reviews.ts`** — product reviews, keyed by `productSlug`. Add a new
  object to add a review; there's no moderation UI, so vet content before
  committing.
- **`data/testimonials.ts`** — homepage testimonial quotes.
- **`data/blog-posts.ts`** — blog posts. `content` supports a small
  markdown-like syntax: blank lines separate paragraphs, `## ` starts a
  heading, `- ` starts a bullet list, and `**text**` is bold.
- **`data/promotions.ts`** — the rolling promo banners shown above the
  homepage hero.
- **`data/instagram-posts.ts`** — the placeholder tiles in the homepage
  Instagram section (see below).

After editing, commit and push — Vercel will redeploy automatically (or run
`npm run build` to verify locally first).

### Sales/promotions

Discount badges and strikethrough pricing are driven by setting a
"Compare-at price" higher than the price on a product in `/admin/products` —
the badge, strikethrough price, and bento "featured" treatment all follow
automatically (see `ProductCard`'s `discountPct` calculation).

### Promo codes / vouchers

Created and managed entirely from `/admin/promo-codes` — a code works
everywhere the moment you create it: the welcome popup (if you create/edit
`WELCOME5` specifically), the cart page's "Promo code" field, and both
`/api/checkout/idram` and `/api/checkout/arca` (which re-validate the code
and recompute the discount server-side — the client-side discount shown in
the cart is never trusted for the actual charge). Codes can have an
optional expiry date and can be disabled without deleting them.

### First-visit welcome popup

`components/marketing/WelcomeModal.tsx` shows once per browser (tracked via
a `localStorage` flag, not cookies) offering the `WELCOME5` code in exchange
for an email address. It posts to the same `/api/newsletter` endpoint as the
footer signup form, then fetches the current `WELCOME5` code/description
from the database — edit that code's percentage or description in
`/admin/promo-codes` and the popup reflects it immediately, no code change.

### Mascot illustration

`components/ui/Mascot.tsx` is a simple flat-SVG bear placeholder shown in
empty cart/wishlist states — a stand-in for real illustrated Max & Lizzy
character art. Swap its contents for real artwork (or an `<Image>` pointing
at exported illustration files) whenever that's ready; every place it's used
imports from this one file.

### Instagram feed

The homepage "Follow along on Instagram" section (`components/home/InstagramFeed.tsx`)
fetches real, live posts server-side via `lib/instagram.ts` (Instagram Graph
API), sorted newest-first and re-fetched hourly (`revalidate: 3600`) — new
posts appear automatically, no redeploy needed. If `INSTAGRAM_ACCESS_TOKEN`
or `INSTAGRAM_USER_ID` isn't set, it falls back to the static placeholder
tiles in `data/instagram-posts.ts`.

To go live:
1. The Instagram account (`@max_and_lizzy_toys`) must be a Business or
   Creator account, connected to a Facebook Page.
2. Create an app at [Meta for Developers](https://developers.facebook.com/apps)
   and add the **Instagram Graph API** product.
3. Generate a short-lived user access token for the account (via the
   Graph API Explorer or an OAuth login flow), then exchange it for a
   **long-lived token** (~60-day expiry) using the
   [long-lived token exchange endpoint](https://developers.facebook.com/docs/instagram-basic-display-api/guides/long-lived-access-tokens).
4. Set `INSTAGRAM_ACCESS_TOKEN` to that long-lived token and
   `INSTAGRAM_USER_ID` to the account's Instagram user ID (returned
   alongside the token, or via `GET /me?fields=user_id`).
5. Long-lived tokens expire after ~60 days — refresh via the same
   endpoint before expiry (Meta emails a warning ahead of time) and
   update `INSTAGRAM_ACCESS_TOKEN` in Vercel's environment variables.

### Adding product/category/blog images

Real photography should replace the generated placeholder SVGs in
`public/images/`. Add new images there and point the relevant `data/` entry
at the new path (e.g. `/images/products/my-toy-1.jpg`). Use square (1:1)
images for products and categories, and 16:9 for blog covers, to match the
existing layout. `scripts/generate-placeholder-images.mjs` is only used to
regenerate the placeholder set — you don't need to touch it.

This applies to category/blog images, which are still edited directly in
`data/`. **Product** photos have a proper upload UI in the admin panel
instead — see "Product photo uploads" below.

### Product photo uploads

The product form's Images section (`/admin/products/new` or the edit page)
lets staff drag and drop or pick photo files directly — no manual file
placement or URL-pasting needed. Uploaded files are stored in [Vercel
Blob](https://vercel.com/docs/storage/vercel-blob) and referenced by their
public URL. Drag any photo's tile to reorder the gallery — the first one is
the product's main image everywhere on the site.

**Setup (one-time, required before the uploader works):**
1. In your Vercel project dashboard, go to **Storage → Create Database →
   Blob**, and connect it to this project. Vercel adds a
   `BLOB_READ_WRITE_TOKEN` environment variable automatically.
2. For local development, copy that token into your local `.env` as
   `BLOB_READ_WRITE_TOKEN=...` (Vercel dashboard → your Blob store →
   `.env.local` tab has a ready-to-copy value), or run `vercel env pull`.

Without the token set, the "+ Add photos" button shows a setup error instead
of silently failing. The old paste-a-URL workflow still works for the CSV
bulk importer, since a spreadsheet cell can't hold an uploaded file — export
photos to Blob/S3/Cloudinary first and put the URL in the CSV's image
columns for that path.

## Admin panel & database

Products, stock, and promo codes live in a database instead of code, so the
business can manage day-to-day changes without a developer or a deploy.

**Local dev** uses SQLite (`prisma/dev.db`, a plain file — zero setup, already
covered in "Getting started" above).

**Production** should use a real Postgres database. The schema
(`prisma/schema.prisma`) is written to be provider-portable — switching from
SQLite to Postgres is a two-line change, not a rewrite:

1. Create a free Postgres database at [neon.tech](https://neon.tech) (pairs
   natively with Vercel) — or Vercel Postgres directly, or any other Postgres
   host.
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to
   `provider = "postgresql"` under `datasource db`.
3. Set `DATABASE_URL` to the real connection string, both in your Vercel
   project's environment variables and locally if you want to develop
   against the same database.
4. Run `npx prisma migrate deploy` once against the new database (this
   applies the existing migration history — it does **not** need
   `migrate dev`, which is a local-only dev workflow).
5. Run `npm run db:seed` once to load the starter catalog and create the
   first admin account (safe to skip if you'd rather add products from
   scratch through the admin UI instead).

**Logging in:** go to `/admin/login`. The first account is created by the
seed script from `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` in your
environment — **change that password after your first login**, or better,
delete those two env vars after the first successful seed so they can't
accidentally re-bootstrap a different account later. Add more staff accounts
from `/admin/staff` (see "Staff accounts & permissions" below) rather than
editing the database directly.

**What's in the admin panel today:**
- **Dashboard** (`/admin`, manager-only) — total and this-month revenue
  (cancelled orders excluded), order/customer/product counts, top 5
  best-selling products by quantity and revenue, an order-volume-by-day-of-week
  chart, and an order-count-by-status breakdown. All computed live from the
  `Order`/`OrderItem`/`Customer` tables — no separate analytics service.
- **Orders** (`/admin/orders`) — every order created by the Idram callback or
  the ArCa return page, filterable by status (pending / ready for pickup / shipped / completed /
  cancelled). The detail page lets you change status and send the customer a
  status-update email with one click (see "Order status emails" below).
  Available to both managers and cashiers.
- **Customers** (`/admin/customers`) — everyone who's checked out, sorted by
  total spend, with per-customer order history. Available to both managers
  and cashiers.
- **Products** (`/admin/products`, manager-only) — add, edit, delete, and
  toggle stock for every product. Editing covers price, compare-at price,
  stock quantity, category, age range, materials, safety notes, images
  (drag-and-drop upload with reordering — see "Product photo uploads"
  below), and
  English/Armenian/Russian text for name and both descriptions. Flags
  (Featured/Bestseller/New) can be added or removed inline from the product
  list — hover a flag pill for a remove (✕) button, or use the "+" button to
  add one, no need to open the edit page.
- **Auto-translate** — on the Add/Edit Product form, filling in the English
  name/short description/description and clicking "✨ Auto-translate Armenian
  & Russian from English" fills in the Armenian and Russian fields for you
  (via the Google Cloud Translation API — see `GOOGLE_TRANSLATE_API_KEY` in
  "Environment variables"). The translated text lands in the same editable
  fields, so you can review and hand-correct anything before saving — nothing
  is ever saved without you clicking Save. Without an API key set, the button
  shows a setup message instead of translating.
- **CSV bulk import** — on `/admin/products`, "Import products from CSV"
  accepts a CSV file (export any spreadsheet — Excel, Google Sheets — as CSV
  first) and creates or updates products in bulk, matched by `slug` so
  re-uploading the same file updates existing products instead of duplicating
  them. Download the template from that same panel for the exact expected
  column headers; rows with a missing slug/name/SKU are skipped and reported
  individually rather than failing the whole import.
- **Bulk product edit** — select any number of products with the checkboxes
  in the product list to reveal a toolbar that can, across the whole
  selection at once: set every price to a fixed AMD amount, adjust every
  price by a percentage (e.g. `-10` for a 10% storewide discount), or add/remove
  a Featured/Bestseller/New tag. Useful for seasonal sales or re-tagging
  hundreds of items without opening each one.
- **Low-stock alerts** — any in-stock product with a tracked quantity at or
  below 5 (`LOW_STOCK_THRESHOLD` in `lib/inventory.ts`) triggers a warning
  banner across every admin page for managers, and a "Low stock" filter pill
  plus inline "⚠ Low stock — N left" note on the product list. Only products
  with a stock quantity entered are checked — leave it blank if you're not
  tracking exact counts for an item.
- **Promo Codes** (`/admin/promo-codes`, manager-only) — create, disable,
  delete codes with a percentage discount, customer-facing description, and
  optional expiry.
- **Staff accounts & permissions** (`/admin/staff`, manager-only) — add or
  remove staff logins and set each to **Manager** (full access) or
  **Cashier** (Orders and Customers only — no Products, Promo Codes, or
  Staff access, enforced both in the sidebar and on the server so a cashier
  can't reach those pages by URL either). You can't demote or delete your
  own account, so there's always at least one manager who can manage staff.

**Order status emails:** changing an order's status in the status dropdown
on its detail page automatically sends a templated email (via Resend)
reflecting the new status — pending, ready for pickup, shipped, completed,
or cancelled — to the customer's email on file. Since this has a real
side effect, the dropdown shows a confirm/cancel step before applying the
change. A separate "Resend status email" button re-sends the email for the
order's current status without changing anything, for retries. Placing a
new order also emails a summary to the store's own inbox (`site.email`) so
staff know to start fulfilling it. Without `RESEND_API_KEY` set, all of
this is logged to the server console instead of actually sending, so you
can develop/test the flow without a Resend account.

**What's intentionally not built yet:**
- **Automatic stock decrement / POS integration.** Stock is managed manually
  from `/admin/products` (or in bulk) — nothing automatically decrements the
  quantity when a web order comes in, and there's no integration with an
  in-store point-of-sale system. If the physical store uses (or will use) a
  specific POS/inventory package, wiring up a sync is a well-scoped follow-up
  once that choice is made.
- **Automated marketing emails.** Order-status emails send automatically
  when staff change an order's status in `/admin/orders/[id]` (with a
  confirm step first, since it emails the customer); there's no scheduled
  newsletter/campaign sender yet. `info@maxandlizzy.com`-style sending is
  already wired through Resend, so a campaign feature would reuse the same
  infrastructure.

## Security

What's already in place, so running the store day-to-day doesn't need
separate security work:

- **HTTPS/SSL** — automatic. Vercel issues and renews a certificate for your
  domain once DNS is pointed at it (see "Domain setup" below); there's
  nothing to configure. All admin and checkout traffic is encrypted in
  transit.
- **Passwords are never stored in plain text** — admin passwords are hashed
  with bcrypt (`lib/admin/auth.ts`) before being written to the database.
- **Sessions are server-verified, not just client-trusted** — logging in
  creates a random session token stored in the `AdminSession` table and set
  as an `httpOnly` cookie (unreadable by JavaScript, so it can't be stolen
  via an XSS bug in the page). Every admin page and Server Action re-checks
  that token against the database and its expiry — nothing is trusted from
  the client alone.
- **Role-based access control** — `lib/admin/permissions.ts` enforces
  manager-vs-cashier restrictions on both the page level (a cashier is
  redirected away from `/admin/products`, `/admin/promo-codes`, `/admin/staff`,
  and the dashboard, even by typing the URL directly) and the Server Action
  level (the underlying create/edit/delete functions refuse the request even
  if someone bypassed the UI), so it isn't just a hidden nav link.
- **Prices are never trusted from the browser** — `/api/checkout/idram` and
  `/api/checkout/arca` always look up the current price from the database
  by product slug; a tampered client-side request can't check out at a
  different price. Promo codes are re-validated server-side the same way.
- **SQL injection isn't a concern** — all database access goes through
  Prisma's parameterized queries; there's no hand-built SQL string
  concatenation anywhere in the app.
- **Idram's callback is checksum-verified** — `/api/idram/callback` recomputes
  Idram's signature from the shared secret and rejects anything that doesn't
  match, so orders can only be created by genuine callbacks, not a forged
  POST request. **ArCa never pushes a callback at all** — the return page
  instead pulls the authoritative result via `getOrderStatusExtended.do`,
  authenticated with our own merchant credentials, so there's nothing for a
  forged request to spoof.

Worth doing as the store grows, not currently built:
- **Rate limiting** on `/admin/login` and public API routes (contact form,
  newsletter signup) to slow down brute-force/spam attempts — fine at low
  traffic, worth adding via Vercel's edge middleware or a service like
  Upstash if abuse becomes a problem.
- **Audit log** of who changed what in the admin panel (price changes, stock
  edits, staff changes) — useful once there are several staff accounts and
  you want to trace back a mistake.
- **Two-factor authentication** for manager accounts, given they can create
  other staff accounts and change prices storewide.

## Internationalization

The site is available in English, Armenian (Հայերեն), and Russian
(Русский) — a language switcher sits in the header next to the cart icon.

- **How it works:** the chosen locale is stored in a cookie (not the URL —
  there's no `/hy/...` or `/ru/...` prefix), read by both Server Components
  (product pages, shop listings) and Client Components (cart, header) via
  `lib/i18n/`. Switching languages calls `router.refresh()` so the whole
  page re-renders in the new language without losing cart/wishlist state.
- **Trade-off:** because pages read a cookie, most routes are server-rendered
  per-request instead of pre-built as static HTML at deploy time. This is a
  reasonable trade for a store this size; if per-language SEO URLs
  (`/hy/shop`, `/ru/shop`) or static-page performance become a priority
  later, that's a bigger restructuring (real locale-prefixed routing) worth
  scoping separately.
- **Translating new content:** product name/description fields have
  Armenian/Russian variants editable right in `/admin/products` (fall back
  to English automatically if left blank). Site-wide UI text (buttons,
  labels, nav) lives in `lib/i18n/dictionaries/{en,hy,ru}.ts` — add a key to
  all three files to introduce new translatable UI copy. The About, Visit
  Us, and Policies pages, plus blog article bodies, are **not yet
  translated** (they're long-form prose, not UI chrome) — ask if you want
  those covered too.

## Domain setup (GoDaddy → Vercel)

**Current state:** `maxandlizzy.com` is live right now as a GoDaddy
**Website Builder** "Coming Soon" page (a video header + "Launching Soon" +
an email signup form) — not just a bare domain sitting in DNS. That matters
because Website Builder sites host their DNS through GoDaddy's own nameservers
and can silently fight with manual DNS record edits. Cancelling/removing the
Website Builder site (Settings → **My Products → Websites + Marketing** →
remove or downgrade that site) before touching DNS avoids that conflict —
do this deliberately, once you're ready, since it takes the placeholder page
down immediately.

GoDaddy otherwise only manages the domain name — the site needs to be hosted
somewhere, and that host's DNS instructions are what you actually follow.
For a Next.js app, [Vercel](https://vercel.com) is the standard, low-effort
choice (built by the Next.js team, generous free tier):

1. Push this repo to GitHub, then import it at
   [vercel.com/new](https://vercel.com/new) — it builds and deploys
   automatically on every push.
2. In the Vercel project, go to **Settings → Domains** and add your domain
   (e.g. `maxandlizzy.com`). Vercel shows you the exact DNS records it needs.
3. In GoDaddy's **DNS Management** for that domain (after removing the
   Website Builder site from step 0), add those records — typically an **A**
   record for the bare domain pointing at Vercel's IP, and a **CNAME** record
   for `www` pointing at `cname.vercel-dns.com`.
4. Propagation takes anywhere from a few minutes to ~48 hours. Vercel
   auto-issues an SSL certificate once it verifies the DNS records.
5. Update `NEXT_PUBLIC_SITE_URL` (in Vercel's environment variables) to your
   real domain — this feeds canonical URLs, the sitemap, and JSON-LD.

Checkout always resolves prices from `data/products.ts` on the server — the
client only sends product slugs and quantities, so prices can't be tampered
with in the browser.

## Armenian payment methods (ARCA / Idram / Telcell)

**ArCa** (via ACBA's vPOS) and **Idram** are both live, real payment options
on the cart page — see their sections below. **Telcell** is a third
Armenian wallet option (~900k+ users) that isn't implemented; worth adding
later if there's specific demand for it.

**What integration looks like:** both work the same way — the bank/wallet
gives you API credentials, your server creates a payment session and
redirects the customer to a hosted payment page, then (ideally) the
processor calls your server back to confirm payment before you mark the
order paid — `app/api/idram/callback` for Idram, or a pull-based check
against `getOrderStatusExtended.do` for ArCa (see `lib/arca.ts`). A third
processor (e.g. Telcell) would follow the same pattern as a sibling
(`lib/telcell.ts` + a checkout branch) without touching the cart, product,
or order code.

Sources: [Armenia's Payment Rails — ArCa, Idram & Instant Transfers](https://www.transfi.com/blog/armenias-payment-rails-how-they-work---arca-idram-instant-transfers), [ArCa for e-merchants](https://old.arca.am/en/emerchants), [Idram online payment system](https://www.idram.am/?l=en), [Telcell Business](https://telcell.am/en/business), [Guide to Payment Processing Solutions in Armenia](https://armenian-lawyer.com/business-immigration/payment-processing-armenia/).

### Idram payment integration

Idram is a real, live payment option on the cart page alongside ArCa,
following Idram's own merchant interface doc. Customers pick "Card" or
"Idram" under Payment method; choosing Idram also asks for an email address,
since Idram never gives the merchant the customer's email.

- **`lib/checkout-validation.ts`** — the cart validation (product prices,
  stock, fulfillment fee, promo code, delivery address) shared by both
  payment providers, so that security-critical logic — never trust a price,
  fee, or discount sent by the client — only lives in one place.
- **`app/api/checkout/idram/route.ts`** — creates a `PendingIdramOrder` row
  (Idram has no server-side session object like Stripe's to hold cart
  contents while the customer pays on Idram's site, so this is our
  equivalent) and returns the payment form fields for the browser to submit
  to Idram.
- **`app/api/idram/callback/route.ts`** — the RESULT_URL. Handles both of
  Idram's callback types: the pre-charge authenticity check
  (`EDP_PRECHECK=YES`, validated against the `PendingIdramOrder` row) and
  the post-charge payment confirmation (verifies `EDP_CHECKSUM`, then calls
  `createOrderFromIdramPayment` in `lib/orders.ts` to persist the real
  `Order`/`Customer` and send the confirmation emails). Must reply with the
  literal text `OK` for the payment to proceed — anything else and Idram
  fails the transaction.
- **`app/(site)/checkout/idram/success/page.tsx`** and **`.../fail/page.tsx`**
  — SUCCESS_URL / FAIL_URL. Just UX confirmation pages; the real source of
  truth for whether a payment happened is the RESULT_URL callback above, not
  these pages (same pattern as ArCa's return page pulling from
  `getOrderStatusExtended.do` rather than trusting the redirect itself).
- **`lib/checkout-emails.ts`** — the staff new-order-notification email,
  shared by the Idram callback and the ArCa return page so the template
  only lives in one place. (Distinct from
  `lib/order-emails.ts`, which sends the admin's manual order-status-change
  emails from `/admin/orders`.) The customer-facing order confirmation itself
  is an Omnisend automation, not sent from here — see "Omnisend" below;
  `lib/omnisend.ts`'s `sendPlacedOrderEvent` is what triggers it.

**The three URLs to give Idram** (already live once this is deployed):
```
SUCCESS_URL: https://yourdomain.com/checkout/idram/success
FAIL_URL:    https://yourdomain.com/checkout/idram/fail
RESULT_URL:  https://yourdomain.com/api/idram/callback
```
Idram issues a test IdramID (`IDRAM_REC_ACCOUNT`) and `IDRAM_SECRET_KEY`
after receiving those. Set both in your environment (locally and in
Vercel's project settings), redeploy, and the "Idram" payment option starts
working — verified end-to-end during development by completing a real test
payment through Idram's actual system and confirming the resulting `Order`
record.

**Idram's own pre-production checklist** (separate from the technical
integration above — this gates *production* access, not the test
credentials) requires the site to already have, in Armenian at minimum: a
privacy policy, a policy covering personal data processing, a
cancellation/return policy (must state so explicitly even if a product
category isn't returnable), terms & conditions covering sale/delivery/
service conditions, visible prices, contact details, and the payment
providers' logos — and the site must be a finished, non-test deployment.
This has all been addressed — see the Privacy/Returns/Terms/Shipping
policy pages, all trilingual (en/hy/ru).

### ARCA (ACBA vPOS) payment integration

ArCa is a real, live payment option on the cart page ("Card (ArCa)"),
processed through ACBA Bank's EPG (SmartVista E-Commerce Payment Gateway —
the same REST platform, `register.do` / `getOrderStatusExtended.do`, that
several Armenian banks run under their own branding), following the bank's
"EPG Merchant Integration Guide". Like Idram, it also asks for an email and
phone number, since the hosted card-entry page never gives the merchant the
customer's email.

Structurally it mirrors the Idram integration above, with one real
difference: **EPG's merchant guide documents no server-to-server push
callback** the way Idram's RESULT_URL does (there is a
"Sending callback notification is allowed" permission listed among the
bank's optional merchant options, which would need to be requested from
ACBA separately if you want one). So instead of verifying an inbound
webhook, the integration *pulls* the authoritative status itself:

- **`lib/arca.ts`** — `registerArcaOrder()` calls `register.do` to create a
  one-phase order and get back a hosted payment page URL (`formUrl`).
  `getArcaOrderStatus()` calls `getOrderStatusExtended.do`, authenticated
  with our own merchant credentials, to find out what actually happened —
  this is why no checksum verification is needed here the way Idram's
  `EDP_CHECKSUM` is: there's no signature to spoof because we're the one
  asking, not the one being told.
- **`app/api/checkout/arca/route.ts`** — creates a `PendingArcaOrder` row
  (EPG has no session object either, same reasoning as `PendingIdramOrder`),
  calls `register.do`, and returns `formUrl` for the browser to navigate to
  directly (no hidden-form POST needed, unlike Idram).
- **`app/(site)/checkout/arca/return/page.tsx`** — the `returnUrl` EPG sends
  the customer's browser back to. Because there's no push callback, *this
  page is the source of truth*: it looks up the `PendingArcaOrder` by the
  `ref` query param, calls `getOrderStatusExtended.do`, and — only on
  `orderStatus === 2` ("deposited") with a matching amount — calls
  `createOrderFromArcaPayment` in `lib/orders.ts` to persist the real
  `Order`/`Customer` and send the confirmation emails. Idempotent, so
  refreshing this page is safe.

**One practical consequence of the pull-only design:** if a customer closes
the tab mid-payment or their browser never makes it back to `returnUrl`, a
completed charge could exist on ACBA's side with no matching `Order` here.
Ask ACBA whether the callback-notification option above can be enabled for
a belt-and-suspenders push confirmation if this turns out to matter in
practice; until then, ACBA's own back office (`epg_gui`) is the fallback
for reconciling any such case manually.

**The one URL to give ACBA** (already live once this is deployed):
```
returnUrl: https://yourdomain.com/checkout/arca/return
```
(In practice this is passed per-request in `register.do`, not configured
once like Idram's three URLs — nothing needs to be given to ACBA up front
beyond what's already in the merchant agreement.)

**Credentials:** ACBA issues `ARCA_USERNAME` (an API login like
`<merchantId>_api`) and `ARCA_PASSWORD` after signing a merchant agreement.
⚠️ **The password ACBA issues initially must be changed on first login** at
`https://epg.arca.am/epg_gui/#login` — API calls fail with "Merchant must
change the password" until that's done. Log in there directly (never share
that password with anyone, including here in code) and update
`ARCA_PASSWORD` afterwards; the new API password must be letters/digits
only, no symbols. Set both in your environment (locally and in Vercel's
project settings) and redeploy, and the "Card (ArCa)" option starts
working.

## Environment variables

See `.env.example` for the full list with comments. Summary:

| Variable | Required? | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite file path locally; a real Postgres connection string in production (see "Admin panel & database") |
| `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` | Yes, once | Creates the first admin account when `npm run db:seed` runs and no admin exists yet |
| `IDRAM_REC_ACCOUNT` / `IDRAM_SECRET_KEY` | No | Enables the "Idram" payment option on the cart page (see "Idram payment integration"). Without them, that option shows a setup error. |
| `ARCA_USERNAME` / `ARCA_PASSWORD` | No | Enables the "Card (ArCa)" payment option on the cart page (see "ARCA (ACBA vPOS) payment integration"). Without them, that option shows a setup error. |
| `RESEND_API_KEY` | No | Enables staff new-order notifications, order-status update, and contact form emails. Without it, they're logged to the server console only. |
| `GOOGLE_TRANSLATE_API_KEY` | No | Enables the "Auto-translate" button on the product form. Without it, the button shows a setup message instead of translating. |
| `BLOB_READ_WRITE_TOKEN` | No | Enables the "+ Add photos" uploader on the product form. Without it, upload attempts show a setup message. See "Product photo uploads" below. |
| `NEXT_PUBLIC_GA_ID` | No | Enables Google Analytics 4. Without it, no analytics script loads. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Your real domain, used in canonical URLs, sitemap, and JSON-LD |
| `CRON_SECRET` / `QA_REPORT_EMAIL` | No | Enables the daily QA watcher email (see "QA watcher" below). Without them, the check still runs on schedule but only logs its report. |

## QA watcher

`vercel.json` schedules a Vercel Cron job that hits `/api/qa-watch` once a
day (`0 5 * * *` — 5am UTC, i.e. 9am Yerevan time year-round, no DST to
account for). The route crawls the live site read-only (sitemap first,
falling back to a homepage crawl if that's missing), checks every page's
HTTP status, verifies every image actually loads, flags any product page
showing "Out of stock", and emails the report via Resend to
`QA_REPORT_EMAIL`. It never writes, deploys, or fixes anything — it only
reports.

Setup:
1. Generate a random secret: `openssl rand -hex 32`.
2. In Vercel's project settings, add `CRON_SECRET` (the value from step 1)
   and `QA_REPORT_EMAIL` (where the report should land) as environment
   variables. `RESEND_API_KEY` must already be set too (see above).
3. Redeploy. Vercel reads `vercel.json` automatically and starts firing the
   cron on the schedule above — no dashboard cron configuration needed.

For local/manual runs instead of waiting for the schedule, use
`scripts/qa-watcher.mjs` (`npm run qa:watch`) — a standalone CLI version of
the same checks, printed to your terminal instead of emailed.

## Deploying to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import it in [Vercel](https://vercel.com/new).
3. Add the environment variables above in the Vercel project settings —
   including a real Postgres `DATABASE_URL` (see "Admin panel & database";
   the SQLite file used in local dev won't persist/work on Vercel).
4. Deploy. Vercel auto-detects Next.js — no extra configuration needed.
5. Point your domain's DNS at Vercel and set `NEXT_PUBLIC_SITE_URL` to match
   (see "Domain setup" above).
6. Give Idram the three live URLs (SUCCESS_URL/FAIL_URL/RESULT_URL) once
   you're ready to go live — see "Idram payment integration" above.

## What we still need from the business before launch

- [ ] **Phone number and email address** — currently placeholders (`TBD`) in
      `data/site.ts`. These also feed the `LocalBusiness` schema, so getting
      them right matters for local SEO / Google Business Profile matching.
- [ ] **Real logo and brand photography** — the logo, hero image, category
      tiles, product photos, and "Visit Us" store photos are all
      programmatically generated SVG placeholders (clearly labeled as such).
      Swap them in `public/images/` per product/category/blog post.
- [ ] **Final product data** — real inventory, descriptions, prices,
      materials, and safety certifications to replace the 20 sample products.
      Edit or delete them from `/admin/products` — no code change needed.
- [ ] **A real Postgres database for production** — see "Admin panel &
      database"; the SQLite file in this repo is local-dev-only.
- [ ] **Change the admin bootstrap password** — log in once with
      `ADMIN_BOOTSTRAP_PASSWORD`, then treat it as compromised and rotate it.
      There's no in-app "change my own password" UI yet — the practical
      workaround is to create a new manager account for yourself from
      `/admin/staff` with a real password, sign in as that account, then
      delete the bootstrap account (you can't delete the account you're
      currently signed in as, so this has to happen in that order).
- [ ] **Genuine customer reviews and testimonials** — replace the sample
      entries in `data/reviews.ts` and `data/testimonials.ts`.
- [ ] **Final About / Visit Us copy** — founder bios, store story, parking
      / directions details are placeholder copy in `app/about/page.tsx` and
      `app/visit-us/page.tsx`, marked with `{/* Placeholder copy */}`
      comments.
- [ ] **Confirm address geocoordinates** — `data/site.ts` has approximate
      lat/long for Mashtots Avenue; confirm against your Google Business
      Profile listing so the embedded map and schema markup are exact.
- [ ] **Shipping/returns policy specifics** — `app/policies/shipping` and
      `app/policies/returns` contain reasonable defaults (30-day returns,
      pickup + Yerevan local delivery) marked `TODO` — confirm real terms,
      delivery radius, and fees.
- [ ] **Legal review of the Privacy Policy** — the placeholder in
      `app/policies/privacy` is a reasonable starting point, not legal advice.
- [ ] **Google Analytics 4 property** — get a Measurement ID and set
      `NEXT_PUBLIC_GA_ID`; the integration is already wired up
      (`components/seo/GoogleAnalytics.tsx`).
- [ ] **Production domain** — update `NEXT_PUBLIC_SITE_URL` and
      `data/site.ts`'s `url` fallback once you have one.

## SEO & accessibility notes

- Every page has a unique title/meta description via `lib/seo.ts`'s
  `buildMetadata()`, plus Open Graph and Twitter card tags.
- `Organization` JSON-LD is emitted site-wide; `LocalBusiness` (as `ToyStore`)
  on the homepage and Visit Us page; `Product` schema (with aggregate rating)
  on product pages; `BreadcrumbList` on category/product/blog pages;
  `BlogPosting` on blog posts.
- `app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and
  `/robots.txt` automatically from the current product/category/blog data.
- Dynamic Open Graph/Twitter share images are generated at build time via
  `next/og` (`app/opengraph-image.tsx`, `app/twitter-image.tsx`) — no manual
  image export needed.
- Single `<h1>` per page, semantic landmarks (`<nav>`, `<main>`, `<address>`),
  skip-to-content link, visible focus states, and alt text on every image.
  Brand colors were adjusted from the initial brown/beige palette where
  needed to meet WCAG AA contrast (4.5:1) for body text and button labels.
- All images use `next/image` for lazy loading, responsive `sizes`, and
  automatic format negotiation.

## Known limitations / things to revisit

- Placeholder images are generated SVGs, not real photography (by design —
  see "What we still need" above).
- Reviews and the newsletter/contact forms have no admin UI or moderation
  queue; they're meant to be edited directly in `data/` or checked via
  server logs (or your Resend inbox, once connected).
- No automatic stock decrement or POS integration — stock is managed
  manually (individually or in bulk) from `/admin/products`. Low-stock
  alerts flag items proactively, but nothing auto-updates counts from a
  physical-store sale yet.
- Only unit tests today (`npm test`, Vitest) covering internal logic like
  checkout validation — no integration tests exercising the actual
  `/api/checkout/idram` / `/api/checkout/arca` routes end-to-end. If the
  product catalog or order logic grows significantly, that would be the
  highest-value next step.
- Because pages read the locale from a cookie, most routes are dynamically
  server-rendered rather than statically pre-built (see
  "Internationalization"). Fine at this traffic scale; revisit if the site
  needs to squeeze out more performance/SEO later.
