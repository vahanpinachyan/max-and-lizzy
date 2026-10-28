import Link from "next/link";
import { prisma } from "@/lib/db";
import { BulkProductsTable, type ProductRow } from "@/components/admin/BulkProductsTable";
import { CsvImportForm } from "@/components/admin/CsvImportForm";
import { requireManagerSession } from "@/lib/admin/permissions";
import { isLowStock } from "@/lib/inventory";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ lowStock?: string; outOfStock?: string }>;
}) {
  await requireManagerSession();
  const { lowStock, outOfStock } = await searchParams;
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

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
        pickBy: p.pickBy,
        image: images[0]?.src ?? null,
      };
    })
    .filter((p) => {
      if (lowStock === "1") return isLowStock(p);
      if (outOfStock === "1") return !p.inStock;
      return true;
    });

  const lowStockCount = products.filter((p) => isLowStock(p)).length;
  // Counted off inStock alone, not stockQuantity: the stock sync that would
  // populate quantities has never run, so every product's stockQuantity is
  // null and a quantity-based count would always read zero.
  const outOfStockCount = products.filter((p) => !p.inStock).length;
  const filtered = lowStock === "1" || outOfStock === "1";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-espresso">
          Products ({rows.length}
          {filtered && ` of ${products.length}`})
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-wood px-5 py-2.5 text-sm font-semibold text-white hover:bg-wood-dark"
        >
          + Add Product
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/products"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${!filtered ? "bg-wood text-white" : "bg-white text-espresso border border-tan/50"}`}
        >
          All
        </Link>
        <Link
          href="/admin/products?lowStock=1"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${lowStock === "1" ? "bg-wood text-white" : "bg-white text-espresso border border-tan/50"}`}
        >
          Low stock {lowStockCount > 0 && `(${lowStockCount})`}
        </Link>
        <Link
          href="/admin/products?outOfStock=1"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${outOfStock === "1" ? "bg-wood text-white" : "bg-white text-espresso border border-tan/50"}`}
        >
          Out of stock {outOfStockCount > 0 && `(${outOfStockCount})`}
        </Link>
      </div>

      <div className="mt-6">
        <CsvImportForm />
      </div>

      <div className="mt-6">
        <BulkProductsTable products={rows} />
      </div>
    </div>
  );
}
