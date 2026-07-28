#!/usr/bin/env node
// Read-only QA watcher for the live site. Never writes, deploys, or mutates
// anything — every request is a GET, and nothing under `results` is fed back
// into a write call. Usage: node scripts/qa-watcher.mjs [baseUrl]

const BASE_URL = (process.argv[2] || "https://max-and-lizzy-eight.vercel.app").replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = 15000;
const CONCURRENCY = 5;
const MAX_CRAWL_PAGES = 500;
const EXCLUDED_PREFIXES = ["/admin", "/api"];
const STATIC_EXT = /\.(png|jpe?g|webp|gif|svg|ico|pdf|xml|txt|css|js|json|woff2?|ttf)$/i;

function log(...args) {
  console.error(...args);
}

async function get(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { redirect: "follow", signal: controller.signal });
    return { ok: true, status: res.status, headers: res.headers, res };
  } catch (err) {
    return { ok: false, status: 0, error: err?.message || String(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function isExcluded(pathname) {
  return EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function extractLocs(xml) {
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  const isIndex = /<sitemapindex/i.test(xml);
  return { locs, isIndex };
}

async function getSitemapUrls() {
  const result = await get(`${BASE_URL}/sitemap.xml`);
  if (!result.ok || result.status !== 200) return null;
  const body = await result.res.text();
  const { locs, isIndex } = extractLocs(body);
  if (locs.length === 0) return null;

  if (!isIndex) return locs;

  // sitemap index — fetch each child sitemap and flatten
  const nested = await mapLimit(locs, CONCURRENCY, async (childUrl) => {
    const r = await get(childUrl);
    if (!r.ok || r.status !== 200) return [];
    const childBody = await r.res.text();
    return extractLocs(childBody).locs;
  });
  return nested.flat();
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractLinks(html, pageUrl) {
  const hrefs = [...html.matchAll(/href=["']([^"'#]+)["']/g)].map((m) => decodeHtmlEntities(m[1]));
  const out = new Set();
  for (const href of hrefs) {
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    let resolved;
    try {
      resolved = new URL(href, pageUrl);
    } catch {
      continue;
    }
    if (resolved.origin !== new URL(BASE_URL).origin) continue;
    if (STATIC_EXT.test(resolved.pathname)) continue;
    if (isExcluded(resolved.pathname)) continue;
    resolved.hash = "";
    out.add(resolved.toString());
  }
  return [...out];
}

async function crawlFromHomepage() {
  const origin = new URL(BASE_URL).origin;
  const visited = new Set();
  const queue = [`${origin}/`];
  const pages = [];

  while (queue.length > 0 && pages.length < MAX_CRAWL_PAGES) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    pages.push(url);

    const result = await get(url);
    if (!result.ok || result.status !== 200) continue;
    const contentType = result.res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) continue;
    const html = await result.res.text();
    for (const link of extractLinks(html, url)) {
      if (!visited.has(link) && !queue.includes(link)) queue.push(link);
    }
  }
  return pages;
}

function extractImageSrcs(html, pageUrl) {
  const srcs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map((m) => decodeHtmlEntities(m[1]));
  const out = new Set();
  for (const src of srcs) {
    if (src.startsWith("data:")) continue;
    try {
      out.add(new URL(src, pageUrl).toString());
    } catch {
      // ignore unparseable src
    }
  }
  return [...out];
}

function checkOutOfStock(html, pageUrl) {
  const pathname = new URL(pageUrl).pathname;
  if (!pathname.startsWith("/product/")) return false;
  return html.includes("Out of stock") || html.includes("Sold out");
}

async function main() {
  log(`QA watcher — read-only scan of ${BASE_URL}`);

  let pageUrls = await getSitemapUrls();
  let source = "sitemap.xml";
  if (!pageUrls || pageUrls.length === 0) {
    log("No usable sitemap.xml — falling back to crawling from the homepage.");
    pageUrls = await crawlFromHomepage();
    source = "homepage crawl";
  }
  pageUrls = pageUrls.filter((u) => !isExcluded(new URL(u).pathname));
  log(`Found ${pageUrls.length} page(s) via ${source}. Checking status + images...`);

  const problems = [];
  const imageCache = new Map(); // url -> { status, ok }
  const outOfStockPages = [];

  await mapLimit(pageUrls, CONCURRENCY, async (url) => {
    const result = await get(url);
    if (!result.ok) {
      problems.push(`${url} - request failed (${result.error})`);
      return;
    }
    if (result.status < 200 || result.status >= 300) {
      problems.push(`${url} - HTTP ${result.status}`);
      return;
    }

    const contentType = result.res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return;

    const html = await result.res.text();

    if (checkOutOfStock(html, url)) {
      outOfStockPages.push(url);
    }

    const imgUrls = extractImageSrcs(html, url);
    for (const imgUrl of imgUrls) {
      if (imageCache.has(imgUrl)) continue;
      imageCache.set(imgUrl, null); // reserve, checked below
    }
    await mapLimit(imgUrls, CONCURRENCY, async (imgUrl) => {
      if (imageCache.get(imgUrl) !== null) return; // already checked by another page
      const imgResult = await get(imgUrl);
      const ok =
        imgResult.ok &&
        imgResult.status >= 200 &&
        imgResult.status < 300 &&
        (imgResult.res.headers.get("content-type") || "").startsWith("image/");
      imageCache.set(imgUrl, ok);
      if (!ok) {
        const reason = imgResult.ok ? `HTTP ${imgResult.status}` : imgResult.error;
        problems.push(`${imgUrl} - image failed to load (${reason}) on ${url}`);
      }
    });
  });

  for (const url of outOfStockPages) {
    problems.push(`${url} - product shows Out of stock`);
  }

  console.log(`Checked ${pageUrls.length} pages.`);
  if (problems.length === 0) {
    console.log("No problems found.");
  } else {
    for (const p of problems) console.log(p);
  }
}

main().catch((err) => {
  log("QA watcher crashed:", err);
  process.exit(1);
});
