import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { site } from "@/data/site";
import { blogPosts } from "@/data/blog-posts";
import { prisma } from "@/lib/db";
import { isLowStock } from "@/lib/inventory";

// Daily site-health check, triggered by Vercel Cron (see vercel.json).
// Strictly read-only against the storefront: every request here is a GET or
// HEAD, and the only database writes are appending/pruning this route's own
// QaWatchRun history table (used to diff today's problems against
// yesterday's) — nothing about the site itself is ever written, deployed,
// or "fixed". See scripts/qa-watcher.mjs for the manual/local crawl-only
// version of these checks (no DB access assumed there).

export const maxDuration = 60;

const REQUEST_TIMEOUT_MS = 10000;
const CONCURRENCY = 10;
const MAX_CRAWL_PAGES = 150;
const EXCLUDED_PREFIXES = ["/admin", "/api"];
const STATIC_EXT = /\.(png|jpe?g|webp|gif|svg|ico|pdf|xml|txt|css|js|json|woff2?|ttf)$/i;
const HISTORY_RUNS_TO_KEEP = 14;

interface Problem {
  key: string; // stable identity across runs, used for the day-over-day diff
  category: "page-error" | "broken-image" | "out-of-stock" | "data-integrity" | "promo-code" | "duplicate-photos" | "broken-link" | "invalid-jsonld";
  title: string;
  detail: string;
  url: string;
}

async function get(url: string, method: "GET" | "HEAD" = "GET") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MaxAndLizzyQAWatch/1.0)" },
    });
    return { ok: true as const, status: res.status, res };
  } catch (err) {
    return { ok: false as const, status: 0, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function isExcluded(pathname: string) {
  return EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function decodeHtmlEntities(str: string) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractLocs(xml: string) {
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  return { locs, isIndex: /<sitemapindex/i.test(xml) };
}

async function getSitemapUrls(baseUrl: string): Promise<string[] | null> {
  const result = await get(`${baseUrl}/sitemap.xml`);
  if (!result.ok || result.status !== 200) return null;
  const body = await result.res.text();
  const { locs, isIndex } = extractLocs(body);
  if (locs.length === 0) return null;
  if (!isIndex) return locs;

  const nested = await mapLimit(locs, CONCURRENCY, async (childUrl) => {
    const r = await get(childUrl);
    if (!r.ok || r.status !== 200) return [] as string[];
    return extractLocs(await r.res.text()).locs;
  });
  return nested.flat();
}

function extractLinks(html: string, pageUrl: string, origin: string) {
  const hrefs = [...html.matchAll(/href=["']([^"'#]+)["']/g)].map((m) => decodeHtmlEntities(m[1]));
  const internal = new Set<string>();
  const external = new Set<string>();
  for (const href of hrefs) {
    if (!href.startsWith("http://") && !href.startsWith("https://")) continue; // skips mailto:, tel:, viber:, javascript:, etc.
    let resolved: URL;
    try {
      resolved = new URL(href, pageUrl);
    } catch {
      continue;
    }
    if (resolved.origin !== origin) {
      external.add(resolved.toString());
      continue;
    }
    if (STATIC_EXT.test(resolved.pathname) || isExcluded(resolved.pathname)) continue;
    resolved.hash = "";
    internal.add(resolved.toString());
  }
  return { internal: [...internal], external: [...external] };
}

async function crawlFromHomepage(baseUrl: string): Promise<string[]> {
  const origin = new URL(baseUrl).origin;
  const visited = new Set<string>();
  const queue = [`${origin}/`];
  const pages: string[] = [];

  while (queue.length > 0 && pages.length < MAX_CRAWL_PAGES) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);
    pages.push(url);

    const result = await get(url);
    if (!result.ok || result.status !== 200) continue;
    const contentType = result.res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) continue;
    const html = await result.res.text();
    for (const link of extractLinks(html, url, origin).internal) {
      if (!visited.has(link) && !queue.includes(link)) queue.push(link);
    }
  }
  return pages;
}

function extractImageSrcs(html: string, pageUrl: string) {
  const srcs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map((m) => decodeHtmlEntities(m[1]));
  const out: string[] = [];
  const seen = new Set<string>();
  for (const src of srcs) {
    if (src.startsWith("data:")) continue;
    try {
      const resolved = new URL(src, pageUrl).toString();
      if (!seen.has(resolved)) {
        seen.add(resolved);
        out.push(resolved);
      }
    } catch {
      // ignore unparseable src
    }
  }
  return out; // order preserved — first entry is treated as the primary/hero image
}

function extractJsonLd(html: string) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
}

function isOutOfStock(html: string, pageUrl: string) {
  if (!new URL(pageUrl).pathname.startsWith("/product/")) return false;
  return html.includes("Out of stock") || html.includes("Sold out");
}

async function checkImage(imgUrl: string): Promise<{ ok: boolean; reason?: string }> {
  let result = await get(imgUrl, "HEAD");
  if (result.ok && result.status === 405) result = await get(imgUrl, "GET");
  if (!result.ok) return { ok: false, reason: result.error };
  const contentType = result.res.headers.get("content-type") || "";
  if (result.status < 200 || result.status >= 300) return { ok: false, reason: `HTTP ${result.status}` };
  if (!contentType.startsWith("image/")) return { ok: false, reason: `unexpected content-type "${contentType}"` };
  return { ok: true };
}

async function checkExternalLink(url: string): Promise<{ ok: boolean; reason?: string }> {
  const result = await get(url, "GET");
  if (!result.ok) return { ok: false, reason: result.error };
  // Only flag clear breakage — 401/403/429 etc. are common bot-blocking
  // responses from sites that work fine for real visitors, so those are
  // deliberately not treated as broken.
  if (result.status === 404 || result.status === 410 || result.status >= 500) {
    return { ok: false, reason: `HTTP ${result.status}` };
  }
  return { ok: true };
}

// Exact byte-hash rather than a perceptual/similarity hash: an 8x8
// average-hash was tried first and produced false positives between
// visually distinct products (e.g. a banjo and a recorder — both thin brown
// objects centered on a white background hash close together despite being
// nothing alike). The real incidents in this catalog's history were the
// same photo file accidentally reused for two different products, not
// merely similar-looking photos, so an exact digest is both simpler and
// has zero false-positive risk for that actual failure mode.
async function computeImageDigest(url: string): Promise<string | null> {
  const result = await get(url, "GET");
  if (!result.ok || result.status < 200 || result.status >= 300) return null;
  try {
    const buffer = Buffer.from(await result.res.arrayBuffer());
    return createHash("sha256").update(buffer).digest("hex");
  } catch {
    return null;
  }
}

async function runCrawl(baseUrl: string) {
  let pageUrls = await getSitemapUrls(baseUrl);
  if (!pageUrls || pageUrls.length === 0) {
    pageUrls = await crawlFromHomepage(baseUrl);
  }
  pageUrls = pageUrls.filter((u) => !isExcluded(new URL(u).pathname));
  const origin = new URL(baseUrl).origin;

  const problems: Problem[] = [];
  const imageCache = new Map<string, boolean>();
  const externalLinkCache = new Map<string, boolean>();
  const productPrimaryImages = new Map<string, string>(); // product page url -> primary image url

  await mapLimit(pageUrls, CONCURRENCY, async (url) => {
    const result = await get(url);
    if (!result.ok) {
      problems.push({ key: `page:${url}`, category: "page-error", title: `request failed (${result.error})`, detail: "", url });
      return;
    }
    if (result.status < 200 || result.status >= 300) {
      problems.push({ key: `page:${url}`, category: "page-error", title: `HTTP ${result.status}`, detail: "", url });
      return;
    }

    const contentType = result.res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return;
    const html = await result.res.text();

    if (isOutOfStock(html, url)) {
      problems.push({ key: `oos:${url}`, category: "out-of-stock", title: "Currently shows Out of stock", detail: "Informational — not necessarily a bug.", url });
    }

    for (const jsonLd of extractJsonLd(html)) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonLd);
      } catch {
        problems.push({
          key: `jsonld:${url}`,
          category: "invalid-jsonld",
          title: "Structured data (JSON-LD) doesn't parse",
          detail: "Malformed JSON-LD can make Google drop rich results (star ratings, price, availability) for this page.",
          url,
        });
        continue;
      }
      // The Product schema's own declared "image" field (lib/seo.ts) is the
      // reliable signal for a product's actual photo — the first <img> tag
      // in the page's HTML is the header logo, not the product photo.
      if (parsed && typeof parsed === "object" && (parsed as { "@type"?: string })["@type"] === "Product") {
        const image = (parsed as { image?: unknown }).image;
        const primary = Array.isArray(image) ? image[0] : image;
        if (typeof primary === "string" && new URL(url).pathname.startsWith("/product/")) {
          productPrimaryImages.set(url, primary);
        }
      }
    }

    const { external } = extractLinks(html, url, origin);
    await mapLimit(external, CONCURRENCY, async (link) => {
      if (externalLinkCache.has(link)) return;
      const check = await checkExternalLink(link);
      externalLinkCache.set(link, check.ok);
      if (!check.ok) {
        problems.push({
          key: `link:${link}`,
          category: "broken-link",
          title: `Broken outbound link (${check.reason})`,
          detail: `Linked from ${url}`,
          url: link,
        });
      }
    });

    const imgUrls = extractImageSrcs(html, url);

    await mapLimit(imgUrls, CONCURRENCY, async (imgUrl) => {
      if (imageCache.has(imgUrl)) return;
      const check = await checkImage(imgUrl);
      imageCache.set(imgUrl, check.ok);
      if (!check.ok) {
        problems.push({
          key: `image:${imgUrl}`,
          category: "broken-image",
          title: `Failed to load (${check.reason})`,
          detail: `Customers will see a blank space instead of a photo on ${url}`,
          url: imgUrl,
        });
      }
    });
  });

  return { pageCount: pageUrls.length, problems, productPrimaryImages };
}

async function runDuplicatePhotoCheck(productPrimaryImages: Map<string, string>): Promise<Problem[]> {
  const entries = [...productPrimaryImages.entries()];
  const digests = await mapLimit(entries, CONCURRENCY, async ([pageUrl, imgUrl]) => {
    const digest = await computeImageDigest(imgUrl);
    return { pageUrl, imgUrl, digest };
  });

  const byDigest = new Map<string, { pageUrl: string; imgUrl: string }[]>();
  for (const d of digests) {
    if (!d.digest) continue;
    if (!byDigest.has(d.digest)) byDigest.set(d.digest, []);
    byDigest.get(d.digest)!.push({ pageUrl: d.pageUrl, imgUrl: d.imgUrl });
  }

  const problems: Problem[] = [];
  for (const group of byDigest.values()) {
    if (group.length <= 1) continue;
    const pageUrls = group.map((g) => g.pageUrl);
    const key = `dup-photo:${[...pageUrls].sort().join("|")}`;
    problems.push({
      key,
      category: "duplicate-photos",
      title: `${group.length} products use the exact same main photo file`,
      detail: `${pageUrls.join(", ")} — customers may think these are the same product, or one is a placeholder/wrong photo.`,
      url: pageUrls[0],
    });
  }
  return problems;
}

async function runDataIntegrityChecks(): Promise<Problem[]> {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      sku: true,
      name: true,
      priceAmd: true,
      images: true,
      inStock: true,
      stockQuantity: true,
      nameHy: true,
      nameRu: true,
      shortDescriptionHy: true,
      shortDescriptionRu: true,
      descriptionHy: true,
      descriptionRu: true,
    },
  });

  const problems: Problem[] = [];
  const skuGroups = new Map<string, typeof products>();
  for (const p of products) {
    if (!skuGroups.has(p.sku)) skuGroups.set(p.sku, []);
    skuGroups.get(p.sku)!.push(p);
  }

  for (const p of products) {
    const url = `${site.url}/product/${p.slug}`;

    if (p.priceAmd <= 0) {
      problems.push({
        key: `data:${p.id}:price`,
        category: "data-integrity",
        title: `"${p.name}" has an invalid price`,
        detail: `Price is ${p.priceAmd} AMD — should be positive.`,
        url,
      });
    }

    let imageCount = 0;
    try {
      imageCount = (JSON.parse(p.images) as unknown[]).length;
    } catch {
      imageCount = 0;
    }
    if (imageCount === 0) {
      problems.push({
        key: `data:${p.id}:no-images`,
        category: "data-integrity",
        title: `"${p.name}" has no photos`,
        detail: "Zero images on this product — it'll show a blank/placeholder tile everywhere on the storefront.",
        url,
      });
    }

    if (p.stockQuantity !== null && p.stockQuantity > 0 && isLowStock(p)) {
      problems.push({
        key: `data:${p.id}:low-stock`,
        category: "data-integrity",
        title: `"${p.name}" is low on stock`,
        detail: `Only ${p.stockQuantity} left — consider reordering soon.`,
        url,
      });
    }

    const missing: string[] = [];
    if (!p.nameHy?.trim()) missing.push("Armenian name");
    if (!p.nameRu?.trim()) missing.push("Russian name");
    if (!p.shortDescriptionHy?.trim()) missing.push("Armenian short description");
    if (!p.shortDescriptionRu?.trim()) missing.push("Russian short description");
    if (!p.descriptionHy?.trim()) missing.push("Armenian description");
    if (!p.descriptionRu?.trim()) missing.push("Russian description");
    if (missing.length > 0) {
      problems.push({
        key: `data:${p.id}:translations`,
        category: "data-integrity",
        title: `"${p.name}" is missing translations`,
        detail: `Falls back to English for: ${missing.join(", ")}.`,
        url,
      });
    }
  }

  for (const group of skuGroups.values()) {
    if (group.length <= 1) continue;
    for (const p of group) {
      problems.push({
        key: `data:${p.id}:duplicate-sku`,
        category: "data-integrity",
        title: `"${p.name}" shares SKU "${p.sku}" with ${group.length - 1} other product(s)`,
        detail: `Same SKU: ${group
          .filter((g) => g.id !== p.id)
          .map((g) => g.name)
          .join(", ")}.`,
        url: `${site.url}/product/${p.slug}`,
      });
    }
  }

  return problems;
}

function runBlogTranslationChecks(): Problem[] {
  const problems: Problem[] = [];
  for (const post of blogPosts) {
    const missing: string[] = [];
    if (!post.titleHy?.trim()) missing.push("Armenian title");
    if (!post.titleRu?.trim()) missing.push("Russian title");
    if (!post.excerptHy?.trim()) missing.push("Armenian excerpt");
    if (!post.excerptRu?.trim()) missing.push("Russian excerpt");
    if (missing.length > 0) {
      problems.push({
        key: `blog:${post.slug}:translations`,
        category: "data-integrity",
        title: `Blog post "${post.title}" is missing translations`,
        detail: `Falls back to English for: ${missing.join(", ")}.`,
        url: `${site.url}/blog/${post.slug}`,
      });
    }
  }
  return problems;
}

async function runPromoCodeChecks(baseUrl: string): Promise<Problem[]> {
  const problems: Problem[] = [];
  const codes = await prisma.promoCode.findMany();
  const now = Date.now();

  const activeUsable = codes.filter((c) => c.active && (!c.expiresAt || c.expiresAt.getTime() >= now));
  const activeButExpired = codes.filter((c) => c.active && c.expiresAt && c.expiresAt.getTime() < now);

  for (const c of activeButExpired) {
    problems.push({
      key: `promo:${c.code}:expired-but-active`,
      category: "promo-code",
      title: `Promo code "${c.code}" is marked active but expired`,
      detail: `Expired ${c.expiresAt!.toISOString().slice(0, 10)} — customers entering it will be confused it doesn't work. Deactivate it in /admin/promo-codes.`,
      url: `${baseUrl}/cart`,
    });
  }

  await mapLimit(activeUsable, CONCURRENCY, async (c) => {
    const result = await get(`${baseUrl}/api/promo-codes?code=${encodeURIComponent(c.code)}&locale=en`);
    if (!result.ok || result.status !== 200) {
      problems.push({
        key: `promo:${c.code}:not-resolving`,
        category: "promo-code",
        title: `Promo code "${c.code}" isn't resolving on the live site`,
        detail: "Active and not expired in the database, but the live /api/promo-codes endpoint didn't return it as valid.",
        url: `${baseUrl}/cart`,
      });
      return;
    }
    const body = (await result.res.json()) as { promo: unknown };
    if (!body.promo) {
      problems.push({
        key: `promo:${c.code}:not-resolving`,
        category: "promo-code",
        title: `Promo code "${c.code}" isn't resolving on the live site`,
        detail: "Active and not expired in the database, but the live /api/promo-codes endpoint didn't return it as valid.",
        url: `${baseUrl}/cart`,
      });
    }
  });

  return problems;
}

function explainPageError(title: string): string {
  if (title.includes("404")) {
    return "Page not found. Visitors and Google can't reach this URL — usually a deleted product, or one with a missing/broken URL slug.";
  }
  if (/HTTP 5\d\d/.test(title)) {
    return "Server error. The page is currently broken for anyone who visits it right now.";
  }
  if (/HTTP 4\d\d/.test(title)) {
    return "Client error. Something about how this page is being requested isn't working.";
  }
  return "Couldn't connect at all — the site or a DNS/network issue may be down.";
}

function plainTextReport(pageCount: number, problems: Problem[]) {
  const lines = [`Checked ${pageCount} pages.`];
  for (const p of problems) lines.push(`${p.url} - ${p.title}`);
  if (problems.length === 0) lines.push("No problems found.");
  return lines.join("\n");
}

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const CATEGORY_LABELS: Record<Problem["category"], string> = {
  "page-error": "Broken pages",
  "broken-image": "Broken images",
  "out-of-stock": "Out of stock",
  "data-integrity": "Catalog data issues",
  "promo-code": "Promo codes",
  "duplicate-photos": "Duplicate photos",
  "broken-link": "Broken outbound links",
  "invalid-jsonld": "Structured data",
};
const CATEGORY_ORDER: Problem["category"][] = [
  "page-error",
  "broken-image",
  "duplicate-photos",
  "broken-link",
  "invalid-jsonld",
  "data-integrity",
  "promo-code",
  "out-of-stock",
];

function htmlReport(pageCount: number, problems: Problem[], newKeys: Set<string>, resolved: { title: string; url: string }[], checkedAt: string) {
  const colors = {
    bg: "#eee0c7",
    wood: "#8f5c37",
    woodDark: "#6e4529",
    espresso: "#3d2b1f",
    terracotta: "#b8552a",
    terracottaDark: "#9c4620",
  };

  const newBadge = `<span style="display:inline-block; background:${colors.terracotta}; color:#fff; font-size:10px; font-weight:700; padding:1px 6px; border-radius:10px; margin-left:6px; vertical-align:middle;">NEW</span>`;

  const section = (title: string, rows: string) => `
    <tr><td style="padding: 20px 0 8px;">
      <div style="font-size: 15px; font-weight: 700; color: ${colors.terracottaDark};">${title}</div>
      <table role="presentation" width="100%" style="border-collapse: collapse; margin-top: 8px;">${rows}</table>
    </td></tr>`;

  const row = (p: Problem) => `
    <tr>
      <td style="padding: 10px 14px; border-left: 3px solid ${colors.terracotta}; background: #fff; border-radius: 4px; display: block; margin-bottom: 8px;">
        <a href="${p.url}" style="color: ${colors.wood}; font-weight: 600; text-decoration: none; word-break: break-all;">${escapeHtml(p.title)}</a>
        ${newKeys.has(p.key) ? newBadge : ""}
        <div style="color: ${colors.espresso}; font-size: 13px; margin-top: 4px;">${escapeHtml(p.detail || explainPageError(p.title))}</div>
        <div style="color: ${colors.wood}; font-size: 12px; margin-top: 4px; word-break: break-all;">${escapeHtml(p.url)}</div>
      </td>
    </tr>`;

  let body = "";
  for (const category of CATEGORY_ORDER) {
    const items = problems.filter((p) => p.category === category);
    if (items.length === 0) continue;
    const sorted = [...items].sort((a, b) => Number(newKeys.has(b.key)) - Number(newKeys.has(a.key)));
    body += section(`${CATEGORY_LABELS[category]} (${items.length})`, sorted.map(row).join(""));
  }

  if (resolved.length > 0) {
    body += `
    <tr><td style="padding: 20px 0 8px;">
      <div style="font-size: 15px; font-weight: 700; color: ${colors.wood};">Resolved since yesterday (${resolved.length})</div>
      <table role="presentation" width="100%" style="border-collapse: collapse; margin-top: 8px;">
        ${resolved
          .map(
            (r) => `<tr><td style="padding: 8px 14px; color: ${colors.woodDark}; font-size: 13px;">${escapeHtml(r.title)}</td></tr>`
          )
          .join("")}
      </table>
    </td></tr>`;
  }

  if (problems.length === 0 && resolved.length === 0) {
    body = `<tr><td style="padding: 24px 0; color: ${colors.espresso};">Every check passed. Nothing to do.</td></tr>`;
  }

  const newCount = problems.filter((p) => newKeys.has(p.key)).length;

  return `
  <div style="background: ${colors.bg}; padding: 32px 16px; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;">
    <table role="presentation" width="100%" style="max-width: 600px; margin: 0 auto; background: #fdfaf3; border-radius: 12px; overflow: hidden;">
      <tr><td style="background: ${colors.espresso}; padding: 20px 24px;">
        <div style="color: #fff; font-size: 18px; font-weight: 700;">${site.name} — Daily Site Check</div>
        <div style="color: ${colors.bg}; font-size: 13px; margin-top: 2px;">${checkedAt}</div>
      </td></tr>
      <tr><td style="padding: 20px 24px 4px; color: ${colors.espresso}; font-size: 14px;">
        Checked <strong>${pageCount}</strong> pages.
        ${
          problems.length === 0
            ? "Everything looks good."
            : `Found <strong>${problems.length}</strong> issue${problems.length === 1 ? "" : "s"}${newCount > 0 ? ` (<strong>${newCount}</strong> new today)` : " — all seen before"}.`
        }
      </td></tr>
      <tr><td style="padding: 0 24px 20px;"><table role="presentation" width="100%">${body}</table></td></tr>
      <tr><td style="padding: 16px 24px; background: ${colors.bg}; color: ${colors.woodDark}; font-size: 12px;">
        Automated, read-only check — this never changes anything on the site. Runs daily at 9am Yerevan time.
      </td></tr>
    </table>
  </div>`;
}

async function sendReportEmail(pageCount: number, problems: Problem[], newKeys: Set<string>, resolved: { title: string; url: string }[]) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipients = (process.env.QA_REPORT_EMAIL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const reportText = plainTextReport(pageCount, problems);

  if (!apiKey || recipients.length === 0) {
    console.log("[qa-watch] Skipping email (RESEND_API_KEY or QA_REPORT_EMAIL not configured):\n" + reportText);
    return { sent: false, reason: "RESEND_API_KEY or QA_REPORT_EMAIL not configured" };
  }

  const checkedAt = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Yerevan",
    dateStyle: "long",
    timeStyle: "short",
  });

  const newCount = problems.filter((p) => newKeys.has(p.key)).length;
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const subject =
    problems.length === 0
      ? `${site.name} site check — all clear`
      : `${site.name} site check — ${problems.length} issue${problems.length === 1 ? "" : "s"}${newCount > 0 ? ` (${newCount} new)` : ""}`;

  await resend.emails.send({
    from: `${site.name} QA Watch <info@${new URL(site.url).hostname}>`,
    to: recipients,
    replyTo: site.email,
    subject,
    text: reportText,
    html: htmlReport(pageCount, problems, newKeys, resolved, checkedAt),
  });
  return { sent: true };
}

async function diffAgainstPreviousRun(problems: Problem[]) {
  const previous = await prisma.qaWatchRun.findFirst({ orderBy: { createdAt: "desc" } });
  const previousItems: { key: string; title: string; url: string }[] = previous ? JSON.parse(previous.problems) : [];
  const previousKeys = new Set(previousItems.map((p) => p.key));
  const currentKeys = new Set(problems.map((p) => p.key));

  const newKeys = new Set(problems.filter((p) => !previousKeys.has(p.key)).map((p) => p.key));
  const resolved = previousItems.filter((p) => !currentKeys.has(p.key)).map((p) => ({ title: p.title, url: p.url }));

  return { newKeys, resolved };
}

async function recordRun(pageCount: number, problems: Problem[]) {
  await prisma.qaWatchRun.create({
    data: {
      pageCount,
      problems: JSON.stringify(problems.map((p) => ({ key: p.key, title: p.title, url: p.url }))),
    },
  });
  const stale = await prisma.qaWatchRun.findMany({
    orderBy: { createdAt: "desc" },
    skip: HISTORY_RUNS_TO_KEEP,
    select: { id: true },
  });
  if (stale.length > 0) {
    await prisma.qaWatchRun.deleteMany({ where: { id: { in: stale.map((s) => s.id) } } });
  }
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[qa-watch] CRON_SECRET is not configured — refusing to run.");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { pageCount, problems, productPrimaryImages } = await runCrawl(site.url);

    const [duplicatePhotos, dataIntegrity, promoCodes] = await Promise.all([
      runDuplicatePhotoCheck(productPrimaryImages),
      runDataIntegrityChecks(),
      runPromoCodeChecks(site.url),
    ]);
    problems.push(...duplicatePhotos, ...dataIntegrity, ...runBlogTranslationChecks(), ...promoCodes);

    const { newKeys, resolved } = await diffAgainstPreviousRun(problems);
    const emailResult = await sendReportEmail(pageCount, problems, newKeys, resolved);
    await recordRun(pageCount, problems);

    return NextResponse.json({
      pageCount,
      problemCount: problems.length,
      newCount: newKeys.size,
      resolvedCount: resolved.length,
      emailSent: emailResult.sent,
      emailReason: "reason" in emailResult ? emailResult.reason : undefined,
    });
  } catch (error) {
    console.error("[qa-watch] Crashed:", error);
    return NextResponse.json({ error: "QA watch crashed — check server logs." }, { status: 500 });
  }
}
