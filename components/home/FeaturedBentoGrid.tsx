import Link from "next/link";
import type { Product } from "@/types";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BentoProductGrid } from "@/components/home/BentoProductGrid";
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
        <BentoProductGrid big1={big1} small={small} />
      </Container>
    </section>
  );
}
