import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionDecorations } from "@/components/ui/Decorations";
import { getServerDictionary } from "@/lib/i18n/server";
import { localizeCategories } from "@/lib/i18n/localize-data";

export async function CategoryTiles() {
  const { dict: t, locale } = await getServerDictionary();
  const categories = localizeCategories(locale);
  return (
    <section className="relative overflow-hidden py-16">
      <SectionDecorations variant="flowers" />
      <Container className="relative">
        <SectionHeading eyebrow={t.home.categoryEyebrow} title={t.home.categoryTitle} />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-tan/50 bg-white transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-square bg-beige">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-espresso group-hover:text-terracotta-dark">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
