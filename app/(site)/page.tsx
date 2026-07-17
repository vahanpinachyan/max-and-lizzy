import type { Metadata } from "next";
import { getFeaturedProducts, getBestsellers } from "@/data/products";
import { buildMetadata, localBusinessJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Hero } from "@/components/home/Hero";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { FeaturedBentoGrid } from "@/components/home/FeaturedBentoGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandTrust } from "@/components/home/BrandTrust";
import { Testimonials } from "@/components/home/Testimonials";
import { InstagramFeed } from "@/components/home/InstagramFeed";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = buildMetadata({
  title: "Max & Lizzy | Wooden & Eco-Friendly Toys in Yerevan",
  description:
    "Shop safety-tested educational, wooden, and eco-friendly toys for babies and preschoolers. Visit our Yerevan store on Mashtots Avenue or shop online.",
  pathname: "/",
  image: "/images/hero-maxlizzy-v1.jpg",
});

export default async function HomePage() {
  const { dict: t, locale } = await getServerDictionary();
  const featured = await getFeaturedProducts(locale);
  const bestsellers = await getBestsellers(locale);

  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <PromoCarousel />
      <Hero />
      <CategoryTiles />
      <FeaturedBentoGrid eyebrow={t.home.featuredEyebrow} title={t.home.featuredTitle} products={featured} />
      <BrandTrust />
      <FeaturedProducts eyebrow={t.home.bestsellersEyebrow} title={t.home.bestsellersTitle} products={bestsellers} />
      <Testimonials />
      <InstagramFeed />
    </>
  );
}
