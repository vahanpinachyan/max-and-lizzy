// Tags for the Next.js data cache entries that wrap database reads.
//
// Neon bills for the time the compute is awake, not per query, and it only
// scales to zero after five minutes idle. A read that runs on every page view
// therefore keeps the database awake around the clock — crawlers walking the
// 700-odd product pages manage it on their own. Caching those reads is what
// creates the idle gaps that actually lower the bill.
//
// Writes clear the relevant tag immediately, so staff never wait on a cache.
export const PRODUCTS_CACHE_TAG = "products";
export const REVIEWS_CACHE_TAG = "reviews";

// Backstop for anything that changes a table without going through a server
// action (a CSV import run outside the app, a manual SQL fix). Normal edits
// invalidate by tag and show up immediately.
export const CACHE_SECONDS = 300;
