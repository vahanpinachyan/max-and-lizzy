import Link from "next/link";
import { prisma } from "@/lib/db";
import { BulkProductsTable, type ProductRow } from "@/components/admin/BulkProductsTable";
import { CsvImportForm } from "@/components/admin/CsvImportForm";
import { requireManagerSession } from "@/lib/admin/permissions";
import { isLowStock } from "@/lib/inventory";
import { getAdminLocale, getAdminDictionary } from "@/lib/admin/i18n";
import { hasSaleSchedule, saleBadge } from "@/lib/admin/sale-status";
import { interpolate } from "@/lib/i18n/interpolate";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ lowStock?: string; outOfStock?: string; onSale?: string }>;
}) {
  await requireManagerSession();
  const locale = await getAdminLocale();
  const t = getAdminDictionary(locale).productsList;
  const { lowStock, outOfStock, onSale } = await searchParams;
  // One clock for the whole page, so a row cannot be counted as scheduled in
  // the filter tab and rendered as active in the table.
  const now = new Date();
  // Only the columns the table actually renders. Selecting everything pulled
  // all three languages of description and safetyInfo as well — about 1.9MB
  // per page load, none of which is displayed here.
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      sku: true,
      name: true,
      category: true,
      priceAmd: true,
      compareAtPriceAmd: true,
      inStock: true,
      stockQuantity: true,
      featured: true,
      bestseller: true,
      newArrival: true,
      onSale: true,
      salePercent: true,
      saleStartsAt: true,
      saleEndsAt: true,
      pickBy: true,
      images: true,
    },
  });

  const rows: ProductRow[] = products
    .map((p) => {
      const images = JSON.parse(p.images) as { src: string; alt: string }[];
      return {
        id: p.id,
        slug: p.slug,
        sku: p.sku,
        name: p.name,
        category: p.category,
        priceAmd: p.priceAmd,
        compareAtPriceAmd: p.compareAtPriceAmd,
        inStock: p.inStock,
        stockQuantity: p.stockQuantity,
        featured: p.featured,
        bestseller: p.bestseller,
        newArrival: p.newArrival,
        onSale: p.onSale,
        pickBy: p.pickBy,
        image: images[0]?.src ?? null,
        sale: saleBadge(p, now),
      };
    })
    .filter((p) => {
      if (lowStock === "1") return isLowStock(p);
      if (outOfStock === "1") return !p.inStock;
      if (onSale === "1") return p.sale !== null;
      return true;
    });

  const lowStockCount = products.filter((p) => isLowStock(p)).length;
  // Counted off inStock alone, not stockQuantity: the stock sync that would
  // populate quantities has never run, so every product's stockQuantity is
  // null and a quantity-based count would always read zero.
  const outOfStockCount = products.filter((p) => !p.inStock).length;
  // Both halves of a campaign: running now, and set up but not started. Staff
  // need to see the scheduled ones most — those are the ones nothing else on
  // the screen reveals.
  const onSaleCount = products.filter((p) => hasSaleSchedule(p, now)).length;
  const filtered = lowStock === "1" || outOfStock === "1" || onSale === "1";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-espresso">{interpolate(filtered ? t.titleFiltered : t.title, { shown: rows.length, total: products.length })}</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-wood px-5 py-2.5 text-sm font-semibold text-white hover:bg-wood-dark"
        >
          {t.addProduct}
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/products"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${!filtered ? "bg-wood text-white" : "bg-white text-espresso border border-tan/50"}`}
        >
          {t.filterAll}
        </Link>
        <Link
          href="/admin/products?lowStock=1"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${lowStock === "1" ? "bg-wood text-white" : "bg-white text-espresso border border-tan/50"}`}
        >
          {t.filterLowStock} {lowStockCount > 0 && `(${lowStockCount})`}
        </Link>
        <Link
          href="/admin/products?outOfStock=1"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${outOfStock === "1" ? "bg-wood text-white" : "bg-white text-espresso border border-tan/50"}`}
        >
          {t.filterOutOfStock} {outOfStockCount > 0 && `(${outOfStockCount})`}
        </Link>
        <Link
          href="/admin/products?onSale=1"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${onSale === "1" ? "bg-wood text-white" : "bg-white text-espresso border border-tan/50"}`}
        >
          {t.filterSaleScheduled} {onSaleCount > 0 && `(${onSaleCount})`}
        </Link>
      </div>

      <div className="mt-6">
        <CsvImportForm t={t} />
      </div>

      <div className="mt-6">
        <BulkProductsTable products={rows} t={t} locale={locale} />
      </div>
    </div>
  );
}
