import { NextResponse } from "next/server";
import { site } from "@/data/site";

// Daily site-health check, triggered by Vercel Cron (see vercel.json).
// Strictly read-only against the storefront: every request here is a GET or
// HEAD, nothing is written, deployed, or "fixed" — it only crawls the live
// site and emails a report. See scripts/qa-watcher.mjs for the manual/local
// version of the same checks; this route duplicates the small crawl helpers
// so it can be tuned for Vercel's function time limit (HEAD requests, higher
// concurrency) without entangling a plain Node CLI script with Next's build.

export const maxDuration = 60;

const REQUEST_TIMEOUT_MS = 10000;
const CONCURRENCY = 10;
const MAX_CRAWL_PAGES = 150;
const EXCLUDED_PREFIXES = ["/admin", "/api"];
const STATIC_EXT = /\.(png|jpe?g|webp|gif|svg|ico|pdf|xml|txt|css|js|json|woff2?|ttf)$/i;

async function get(url: string, method: "GET" | "HEAD" = "GET") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { method, redirect: "follow", signal: controller.signal });
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
  const out = new Set<string>();
  for (const href of hrefs) {
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    let resolved: URL;
    try {
      resolved = new URL(href, pageUrl);
    } catch {
      continue;
    }
    if (resolved.origin !== origin) continue;
    if (STATIC_EXT.test(resolved.pathname) || isExcluded(resolved.pathname)) continue;
    resolved.hash = "";
    out.add(resolved.toString());
  }
  return [...out];
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
    for (const link of extractLinks(html, url, origin)) {
      if (!visited.has(link) && !queue.includes(link)) queue.push(link);
    }
  }
  return pages;
}

function extractImageSrcs(html: string, pageUrl: string) {
  const srcs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map((m) => decodeHtmlEntities(m[1]));
  const out = new Set<string>();
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

async function runQaWatch(baseUrl: string) {
  let pageUrls = await getSitemapUrls(baseUrl);
  if (!pageUrls || pageUrls.length === 0) {
    pageUrls = await crawlFromHomepage(baseUrl);
  }
  pageUrls = pageUrls.filter((u) => !isExcluded(new URL(u).pathname));

  const problems: string[] = [];
  const outOfStockPages: string[] = [];
  const imageCache = new Map<string, boolean>();

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

    if (isOutOfStock(html, url)) outOfStockPages.push(url);

    const imgUrls = extractImageSrcs(html, url);
    await mapLimit(imgUrls, CONCURRENCY, async (imgUrl) => {
      if (imageCache.has(imgUrl)) return;
      const check = await checkImage(imgUrl);
      imageCache.set(imgUrl, check.ok);
      if (!check.ok) {
        problems.push(`${imgUrl} - image failed to load (${check.reason}) on ${url}`);
      }
    });
  });

  for (const url of outOfStockPages) {
    problems.push(`${url} - product shows Out of stock`);
  }

  return { pageCount: pageUrls.length, problems };
}

function formatReport(pageCount: number, problems: string[]) {
  const lines = [`Checked ${pageCount} pages.`];
  if (problems.length === 0) {
    lines.push("No problems found.");
  } else {
    lines.push(...problems);
  }
  return lines.join("\n");
}

async function sendReportEmail(reportText: string, problemCount: number) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipients = (process.env.QA_REPORT_EMAIL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!apiKey || recipients.length === 0) {
    console.log("[qa-watch] Skipping email (RESEND_API_KEY or QA_REPORT_EMAIL not configured):\n" + reportText);
    return { sent: false, reason: "RESEND_API_KEY or QA_REPORT_EMAIL not configured" };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const subject =
    problemCount === 0
      ? `${site.name} QA watch — all clear`
      : `${site.name} QA watch — ${problemCount} issue${problemCount === 1 ? "" : "s"} found`;

  await resend.emails.send({
    from: `${site.name} QA Watch <info@${new URL(site.url).hostname}>`,
    to: recipients,
    replyTo: site.email,
    subject,
    text: reportText,
    html: `<pre style="font-family: ui-monospace, monospace; white-space: pre-wrap;">${reportText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</pre>`,
  });
  return { sent: true };
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
    const { pageCount, problems } = await runQaWatch(site.url);
    const reportText = formatReport(pageCount, problems);
    const emailResult = await sendReportEmail(reportText, problems.length);

    return NextResponse.json({
      pageCount,
      problemCount: problems.length,
      emailSent: emailResult.sent,
      emailReason: "reason" in emailResult ? emailResult.reason : undefined,
    });
  } catch (error) {
    console.error("[qa-watch] Crashed:", error);
    return NextResponse.json({ error: "QA watch crashed — check server logs." }, { status: 500 });
  }
}
