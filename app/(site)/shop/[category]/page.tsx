import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getCategory } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { getServerDictionary } from "@/lib/i18n/server";
import { localizeCategory } from "@/lib/i18n/localize-data";

export function generateStaticParams() {
  return categories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return buildMetadata({
    title: category.name,
    description: `Shop ${category.name.toLowerCase()} toys: ${category.shortDescription}`,
    pathname: `/shop/${category.slug}`,
    image: category.image,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sub?: string }>;
}) {
  const { category: slug } = await params;
  const rawCategory = getCategory(slug);
  if (!rawCategory) notFound();

  const { sub } = await searchParams;
  const initialSubcategory = rawCategory.subcategories.some((s) => s.slug === sub) ? sub : undefined;

  const { dict: t, locale } = await getServerDictionary();
  const category = localizeCategory(rawCategory, locale);
  const categoryProducts = await getProductsByCategory(rawCategory.slug, locale);
  const materials = Array.from(new Set(categoryProducts.flatMap((p) => p.materials))).sort();
  const brands = Array.from(new Set(categoryProducts.map((p) => p.brand))).sort();

  return (
    <Container className="py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.shop, path: "/shop" },
          { name: category.name, path: `/shop/${category.slug}` },
        ])}
      />
      <nav aria-label={t.breadcrumb.ariaLabel} className="mb-4 text-sm text-espresso/70">
        <ol className="flex gap-2">
          <li><Link href="/shop" className="hover:text-terracotta-dark">{t.nav.shop}</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-espresso">{category.name}</li>
        </ol>
      </nav>
      <h1 className="text-4xl font-bold text-espresso">{category.name}</h1>
      <p className="mt-2 max-w-2xl text-espresso/70">{category.shortDescription}</p>
      <div className="mt-8">
        <ShopCatalog
          products={categoryProducts}
          category={category}
          materials={materials}
          brands={brands}
          initialSubcategory={initialSubcategory}
        />
      </div>
    </Container>
  );
}
