import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { WishlistContent } from "@/components/shop/WishlistContent";
import { SectionDecorations } from "@/components/ui/Decorations";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = buildMetadata({
  title: "Your Wishlist",
  description: "Toys you've saved for later at Max & Lizzy.",
  pathname: "/wishlist",
  noIndex: true,
});

export default async function WishlistPage() {
  const { dict: t } = await getServerDictionary();
  return (
    <Container className="relative overflow-hidden py-12">
      <SectionDecorations variant="flowers" />
      <h1 className="relative text-4xl font-bold text-espresso sm:text-5xl">{t.wishlist.title}</h1>
      <p className="relative mt-3 max-w-2xl text-espresso/70">
        {t.wishlist.subtitle}
      </p>
      <div className="relative">
        <WishlistContent />
      </div>
    </Container>
  );
}
