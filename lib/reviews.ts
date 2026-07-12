import "server-only";
import { prisma } from "@/lib/db";
import type { ProductReview, ProductRating } from "@/types";

function toProductReview(row: {
  id: string;
  productSlug: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: Date;
  orderId: string | null;
}): ProductReview {
  return {
    id: row.id,
    productSlug: row.productSlug,
    author: row.authorName,
    rating: row.rating as 1 | 2 | 3 | 4 | 5,
    title: row.title,
    body: row.body,
    date: row.createdAt.toISOString(),
    verifiedPurchase: row.orderId !== null,
  };
}

export async function getApprovedReviews(slug: string): Promise<ProductReview[]> {
  const rows = await prisma.review.findMany({
    where: { productSlug: slug, approved: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProductReview);
}

export async function getAverageRating(slug: string): Promise<number | null> {
  const result = await prisma.review.aggregate({
    where: { productSlug: slug, approved: true },
    _avg: { rating: true },
  });
  return result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : null;
}

// Single grouped query for rating/count across many products at once, so
// list pages (Shop, Home) don't run one query per ProductCard.
export async function getRatingsMap(slugs: string[]): Promise<Map<string, ProductRating>> {
  const map = new Map<string, ProductRating>();
  if (slugs.length === 0) return map;
  const grouped = await prisma.review.groupBy({
    by: ["productSlug"],
    where: { productSlug: { in: slugs }, approved: true },
    _avg: { rating: true },
    _count: { _all: true },
  });
  for (const g of grouped) {
    map.set(g.productSlug, {
      average: g._avg.rating ? Math.round(g._avg.rating * 10) / 10 : null,
      count: g._count._all,
    });
  }
  return map;
}

interface SubmitReviewInput {
  orderId: string;
  productSlug: string;
  rating: number;
  title: string;
  body: string;
  authorName: string;
}

export class ReviewSubmissionError extends Error {}

// Verifies the reviewer actually bought this product on this order before
// creating the review — this is what backs the "Verified Purchase" badge.
export async function submitReview(input: SubmitReviewInput) {
  const { orderId, productSlug, rating, title, body, authorName } = input;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ReviewSubmissionError("Rating must be an integer between 1 and 5.");
  }
  const trimmedTitle = title.trim().slice(0, 120);
  const trimmedBody = body.trim().slice(0, 2000);
  const trimmedName = authorName.trim().slice(0, 80);
  if (!trimmedTitle || !trimmedBody || !trimmedName) {
    throw new ReviewSubmissionError("Title, review, and name are required.");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) {
    throw new ReviewSubmissionError("Order not found.");
  }
  const purchased = order.items.some((item) => item.productSlug === productSlug);
  if (!purchased) {
    throw new ReviewSubmissionError("This order does not include that product.");
  }

  const existing = await prisma.review.findFirst({
    where: { orderId, productSlug },
  });
  if (existing) {
    throw new ReviewSubmissionError("You've already reviewed this product for this order.");
  }

  return prisma.review.create({
    data: {
      orderId,
      productSlug,
      rating,
      title: trimmedTitle,
      body: trimmedBody,
      authorName: trimmedName,
      approved: false,
    },
  });
}
