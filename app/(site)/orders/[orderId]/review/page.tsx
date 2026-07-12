import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getProductsBySlugs } from "@/data/products";
import { Container } from "@/components/ui/Container";
import { ReviewForm } from "@/components/product/ReviewForm";
import { Badge } from "@/components/ui/Badge";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Rate Your Order", robots: { index: false, follow: false } };

export default async function OrderReviewPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const { dict: t, locale } = await getServerDictionary();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, reviews: true },
  });

  if (!order) {
    return (
      <Container className="max-w-xl py-16 text-center">
        <h1 className="text-3xl font-bold text-espresso">{t.product.orderNotFoundTitle}</h1>
        <p className="mt-3 text-espresso/70">{t.product.orderNotFoundBody}</p>
      </Container>
    );
  }

  const reviewedSlugs = new Set(order.reviews.map((r) => r.productSlug));
  const itemsWithSlug = order.items.filter((i): i is typeof i & { productSlug: string } => Boolean(i.productSlug));
  const products = await getProductsBySlugs(
    Array.from(new Set(itemsWithSlug.map((i) => i.productSlug))),
    locale
  );
  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  return (
    <Container className="max-w-2xl py-12">
      <h1 className="text-3xl font-bold text-espresso sm:text-4xl">{t.product.orderReviewPageTitle}</h1>
      <p className="mt-2 text-espresso/70">{t.product.orderReviewPageBody}</p>

      <div className="mt-8 space-y-5">
        {itemsWithSlug.map((item) => {
          const product = productBySlug.get(item.productSlug);
          const name = product?.name ?? item.productName;
          const alreadyReviewed = reviewedSlugs.has(item.productSlug);
          return (
            <div key={item.id}>
              {alreadyReviewed ? (
                <div className="flex items-center justify-between rounded-2xl border border-tan/50 bg-white p-5">
                  <p className="font-semibold text-espresso">{name}</p>
                  <Badge variant="sage">{t.product.reviewedLabel}</Badge>
                </div>
              ) : (
                <ReviewForm orderId={order.id} productSlug={item.productSlug} productName={name} />
              )}
            </div>
          );
        })}
      </div>
    </Container>
  );
}
