import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

// Twice-daily stock sync from the shop's own SQL Server, pushed in (not
// pulled) by a script running on that network — see README "Stock sync"
// for the full setup. This endpoint only ever updates stockQuantity/inStock
// on products that already exist; it can't create, delete, price, or
// otherwise touch anything else, so a leaked secret's blast radius is
// limited to bad stock numbers, not the catalog itself.

const MAX_ITEMS_PER_REQUEST = 2000;

interface SyncItem {
  sku: string;
  stockQuantity: number;
}

interface SyncResult {
  updated: { sku: string; slug: string; stockQuantity: number }[];
  notFound: string[];
  // sku isn't a unique DB constraint (see the QA watcher's duplicate-sku
  // check) — if more than one product shares a sku, we refuse to guess
  // which one the incoming number belongs to rather than silently update
  // the wrong product.
  ambiguous: string[];
  invalid: { sku: unknown; reason: string }[];
}

function parseItems(body: unknown): { items: SyncItem[]; invalid: SyncResult["invalid"] } {
  const raw = body && typeof body === "object" ? (body as { items?: unknown }).items : undefined;
  if (!Array.isArray(raw)) return { items: [], invalid: [] };

  const items: SyncItem[] = [];
  const invalid: SyncResult["invalid"] = [];
  for (const entry of raw) {
    const sku = entry && typeof entry === "object" ? (entry as { sku?: unknown }).sku : undefined;
    const stockQuantity = entry && typeof entry === "object" ? (entry as { stockQuantity?: unknown }).stockQuantity : undefined;
    if (typeof sku !== "string" || sku.trim() === "") {
      invalid.push({ sku, reason: "sku must be a non-empty string" });
      continue;
    }
    if (typeof stockQuantity !== "number" || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
      invalid.push({ sku, reason: "stockQuantity must be a non-negative integer" });
      continue;
    }
    items.push({ sku, stockQuantity });
  }
  return { items, invalid };
}

export async function POST(request: Request) {
  const secret = process.env.STOCK_SYNC_SECRET;
  if (!secret) {
    console.error("[stock-sync] STOCK_SYNC_SECRET is not configured — refusing to run.");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { items, invalid } = parseItems(body);
  if (items.length === 0 && invalid.length === 0) {
    return NextResponse.json({ error: "Expected { items: [{ sku, stockQuantity }] }" }, { status: 400 });
  }
  if (items.length > MAX_ITEMS_PER_REQUEST) {
    return NextResponse.json({ error: `Too many items — max ${MAX_ITEMS_PER_REQUEST} per request` }, { status: 400 });
  }

  const result: SyncResult = { updated: [], notFound: [], ambiguous: [], invalid };
  const slugsToRevalidate = new Set<string>();

  for (const { sku, stockQuantity } of items) {
    const matches = await prisma.product.findMany({ where: { sku }, select: { id: true, slug: true } });
    if (matches.length === 0) {
      result.notFound.push(sku);
      continue;
    }
    if (matches.length > 1) {
      result.ambiguous.push(sku);
      continue;
    }
    const product = matches[0];
    await prisma.product.update({
      where: { id: product.id },
      data: { stockQuantity, inStock: stockQuantity > 0 },
    });
    result.updated.push({ sku, slug: product.slug, stockQuantity });
    slugsToRevalidate.add(product.slug);
  }

  if (result.updated.length > 0) {
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    for (const slug of slugsToRevalidate) revalidatePath(`/product/${slug}`);
  }

  console.log(
    `[stock-sync] updated=${result.updated.length} notFound=${result.notFound.length} ambiguous=${result.ambiguous.length} invalid=${result.invalid.length}`
  );

  return NextResponse.json(result);
}
