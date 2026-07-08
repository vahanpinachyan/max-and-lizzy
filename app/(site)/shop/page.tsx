import type { Metadata } from "next";
import { getAllProducts, getAllMaterials, getAllBrands } from "@/data/products";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = buildMetadata({
  title: "Shop All Toys",
  description:
    "Browse our full collection of educational, wooden, and eco-friendly toys for babies and preschoolers, with filters for age, price, material, and brand.",
  pathname: "/shop",
});

export default async function ShopPage() {
  const { dict: t, locale } = await getServerDictionary();
  const [products, materials, brands] = await Promise.all([
    getAllProducts(locale),
    getAllMaterials(),
    getAllBrands(),
  ]);
  return (
    <Container className="py-12">
      <h1 className="text-4xl font-bold text-espresso">{t.product.shopTitle}</h1>
      <p className="mt-2 max-w-2xl text-espresso/70">
        {t.product.shopDescription}
      </p>
      <div className="mt-8">
        <ShopCatalog products={products} materials={materials} brands={brands} />
      </div>
    </Container>
  );
}
