import Link from "next/link";
import type { Product } from "@/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/shop/ProductCard";
import { getServerDictionary } from "@/lib/i18n/server";

export async function FeaturedBentoGrid({
  title,
  eyebrow,
  products,
}: {
  title: string;
  eyebrow: string;
  products: Product[];
}) {
  const { dict: t } = await getServerDictionary();
  const [big1, ...rest] = products;
  const small = rest.slice(0, 4);
  if (!big1) return null;

  return (
    <section className="py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={eyebrow} title={title} />
          <Link href="/shop" className="font-semibold text-terracotta-dark hover:underline">
            {t.nav.shopAllProducts}
          </Link>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <ProductCard product={big1} size="large" />
          <div className="grid grid-cols-2 gap-4">
            {small.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
