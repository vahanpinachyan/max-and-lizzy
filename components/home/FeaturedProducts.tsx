import Link from "next/link";
import type { Product } from "@/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FlatProductGrid } from "@/components/home/FlatProductGrid";
import { getServerDictionary } from "@/lib/i18n/server";

export async function FeaturedProducts({
  title,
  eyebrow,
  products,
}: {
  title: string;
  eyebrow: string;
  products: Product[];
}) {
  const { dict: t } = await getServerDictionary();
  return (
    <section className="py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={eyebrow} title={title} />
          <Link href="/shop" className="font-semibold text-terracotta-dark hover:underline">
            {t.nav.shopAllProducts}
          </Link>
        </div>
        <FlatProductGrid products={products} />
      </Container>
    </section>
  );
}
