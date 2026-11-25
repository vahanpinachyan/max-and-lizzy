# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Parents buying toys for their own young children, primarily ages 0–6 (the catalogue's
own age ranges are `0-3` and `3-6`). They are in Yerevan or reachable by Armenian
courier, and they read Armenian, Russian or English — all three are shipped locales.

Online ordering is a **real sales channel**, not a shop window for the physical store.
The site has to close the sale, so checkout, stock accuracy and product pages carry as
much weight as the storefront pages. The Mashtots Avenue shop is a second channel, not
the destination every page funnels toward.

Gift buyers are a real secondary audience (gift wrap exists in checkout, and New Year is
Armenia's gift-giving peak) but have not been confirmed as a design priority.

## Product Purpose

A toy shop selling educational, wooden and eco-friendly toys for babies and preschoolers,
run from one store at 50 Mesrop Mashtots Avenue, Yerevan, with a transacting website at
maxandlizzy.com. Success is an order placed — picked up in store or delivered — not a
visit logged.

## Positioning

Curation against three stated tests, applied to every item before it reaches a shelf:
honest sustainable materials, durability under real everyday play, and a skill it actually
builds (fine motor control, early language, spatial reasoning) rather than minutes
occupied. The stock is imported from established European workshops — GOKI (Germany),
Nattou (Belgium), Holztiger (Germany) — and safety-tested to EN 71 and ASTM F963.

A general Armenian toy retailer could not truthfully claim the same filter. The
positioning is *what was refused*, not breadth.

## Operating Context

- One physical store, 50 Mesrop Mashtots Avenue, Yerevan 0009. Open 10:00–21:00, seven days.
- Fulfilment: free same-day pickup in store; delivery within Yerevan 1,000 AMD, within
  24 hours; delivery outside Yerevan 1,000 AMD via Haypost courier, 3–5 days, final cost
  varying by weight.
- Payment through Idram and ARCA — Armenian processors, not Stripe or PayPal.
- Prices in AMD throughout.
- Customer transactional and marketing email runs through Omnisend automations.
- ~710 products live in production. Browsing is by category, subcategory, age range, brand
  and a curated 10-group material facet.
- Staff run the shop through an admin panel that is itself localised into Armenian.

## Capabilities and Constraints

Live: catalogue with search and faceted filters, product pages, cart, wishlist, reviews,
promo codes, promotions with scheduled run dates, blog, checkout with the three fulfilment
options above, order status emails, and a staff admin for products, orders, customers,
reviews, promo codes and staff.

Gift wrap is implemented end-to-end at 600 AMD and is **never promoted anywhere on the
storefront** — an existing capability with no surface.

Technical constraints that bind design work:

- **Vercel image optimization is disabled** (it hit a 402 quota wall and broke every photo).
  Images are pre-optimized originals. Any new asset must be hand-optimized before it ships,
  and decorative elements are cheaper as SVG or CSS than as image files.
- Three locales — `en`, `hy`, `ru` — selected by an `ml-locale` cookie. Armenian and Russian
  set their own font stack (Noto Serif/Sans Armenian), so any type decision has to survive
  a script change. Layouts must tolerate Armenian's longer strings.
- `/shop` is deliberately uncached and already serializes ~1.9 MB; it cannot absorb much more
  per-request weight.
- Production database is Neon Postgres, billed by compute wake time, which rules out polling.
- Legal registration number and tax ID are still unfilled in `data/site.ts` and
  `/policies/terms`. Do not invent them.

## Brand Commitments

**Max and Lizzy are illustrated characters, not a logotype.** Two children rendered in soft
coloured pencil with visible paper grain — muted dusty rose, warm browns, cream. Lizzy holds
a wooden rocking horse; Max is mid-stride, hands behind his back. They speak in first person
in the hero ("Hey! I'm Max!"). Assets: `public/images/hero-max-v1.png`,
`hero-lizzy-v1.png`, `max-avatar.png`, `lizzy-avatar.png`, `mascot-max-lizzy.png`.

**No more artwork in that hand is obtainable.** The existing PNGs are the complete set. Any
new visual element has to sit beside pencil-textured storybook illustration without competing
with it — flat hard-edged geometric vector next to these reads as clip-art. This is a
confirmed constraint, established after a seasonal decoration built that way was rejected.

Palette in code ("Nature Distilled"): cream `#f7f2e6`, beige `#eee0c7`, tan `#d9c4a0`,
wood `#8f5c37`, espresso `#3d2b1f`, sage `#7c9473`, terracotta `#b8552a`, rose `#b44b5a`.
Type: Bitter (slab serif, chosen to echo chunky wooden blocks) for headings, Golos Text for
body; Noto Serif/Sans Armenian for `hy`. Faces are vendored in `public/fonts`, never fetched
from Google at build time.

Voice: first person plural, parent-to-parent, specific rather than promotional — "we couldn't
find a toy store we trusted for our own kids, so we built one."

Legal entity: Baby Land LLC / «Բեյբի Լենդ» ՍՊԸ.

## Evidence on Hand

Real: verified Google Business Profile ("Max & Lizzy Toys", 5.0 stars); the store's own
photography in `public/images/store`; the three named European brands; EN 71 and ASTM F963
safety testing; customer reviews collected through the site's own review flow.

Absent — must not be fabricated: registration and tax IDs, certification claims beyond EN 71
and ASTM F963, materials or age ratings not present in the product record, and any testimonial
or press not already in the repository. Product safety claims for children's toys are never
inferred or invented.

## Product Principles

1. **Curation is the product.** What was refused matters more than catalogue size; design
   should make the filter visible, not bury it under breadth.
2. **The site closes sales.** Stock truth, price clarity and checkout outrank decoration.
3. **Max and Lizzy carry the brand.** The characters are the differentiator; nothing added
   should out-shout them or sit in a different drawing hand.
4. **Three scripts, one brand.** Armenian, Russian and English must each feel native, not
   like a translation layer over an English site.
5. **Parent-to-parent, never promotional.** Specific claims that are true, in the shop's own
   voice.

## Accessibility & Inclusion

The codebase already holds a deliberate baseline that new work must not regress: a skip link,
`:focus-visible` rings drawn with `box-shadow` so they follow each element's border-radius,
`prefers-reduced-motion` handling on every existing animation, ARIA labelling on the
promotion carousel and announcement marquee, and hand-drawn form controls so checkboxes do
not fall back to OS defaults.

Decorative elements are `aria-hidden` and `pointer-events-none` by convention
(`components/ui/Decorations.tsx` is the reference implementation).

Primary users are frequently one-handed on a phone with a small child present. Phone layout
is the real case, not the fallback.
