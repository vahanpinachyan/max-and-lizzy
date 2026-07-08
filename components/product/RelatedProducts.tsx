import type { Product } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/shop/ProductCard";
import { getServerDictionary } from "@/lib/i18n/server";

export async function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  const { dict: t } = await getServerDictionary();
  return (
    <section className="mt-16">
      <SectionHeading eyebrow={t.product.relatedEyebrow} title={t.product.relatedTitle} />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
