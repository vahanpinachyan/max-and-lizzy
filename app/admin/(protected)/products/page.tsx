import Link from "next/link";
import { prisma } from "@/lib/db";
import { BulkProductsTable, type ProductRow } from "@/components/admin/BulkProductsTable";
import { CsvImportForm } from "@/components/admin/CsvImportForm";
import { requireManagerSession } from "@/lib/admin/permissions";
import { isLowStock } from "@/lib/inventory";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ lowStock?: string }>;
}) {
  await requireManagerSession();
  const { lowStock } = await searchParams;
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
        image: images[0]?.src ?? null,
      };
    })
    .filter((p) => (lowStock === "1" ? isLowStock(p) : true));

  const lowStockCount = products.filter((p) => isLowStock(p)).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-espresso">Products ({products.length})</h1>
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
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${!lowStock ? "bg-wood text-white" : "bg-white text-espresso border border-tan/50"}`}
        >
          All
        </Link>
        <Link
          href="/admin/products?lowStock=1"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${lowStock === "1" ? "bg-wood text-white" : "bg-white text-espresso border border-tan/50"}`}
        >
          Low stock {lowStockCount > 0 && `(${lowStockCount})`}
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
