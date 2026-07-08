import type { ProductReview } from "@/types";

// Placeholder product reviews — replace with genuine, moderated customer
// reviews. To add a review, append an object here with a unique id.
export const reviews: ProductReview[] = [
  {
    id: "r1",
    productSlug: "stacking-rainbow-arches",
    author: "Nare S.",
    rating: 5,
    title: "Beautiful and sturdy",
    body: "Bought this for my 1-year-old and the quality is fantastic. The colors are soft, not garish, and it fits our living room nicely as a shelf toy too.",
    date: "2026-03-14",
    verifiedPurchase: true,
  },
  {
    id: "r2",
    productSlug: "stacking-rainbow-arches",
    author: "Hovhannes P.",
    rating: 5,
    title: "Worth the price",
    body: "Heavier and better made than the plastic version we had before. Arches nest perfectly every time.",
    date: "2026-02-02",
    verifiedPurchase: true,
  },
  {
    id: "r3",
    productSlug: "chunky-shape-sorter",
    author: "Mariam G.",
    rating: 4,
    title: "Great first sorter",
    body: "My son needed a little help at first but now does it independently. Wish it had a couple more shapes but overall very happy.",
    date: "2026-01-20",
    verifiedPurchase: true,
  },
  {
    id: "r4",
    productSlug: "first-building-blocks-set",
    author: "Tigran A.",
    rating: 5,
    title: "Best toy in the house",
    body: "Both our kids (2 and 5) play with this daily. The canvas bag is a nice touch for cleanup.",
    date: "2026-03-01",
    verifiedPurchase: true,
  },
  {
    id: "r5",
    productSlug: "wooden-balance-bike",
    author: "Sona V.",
    rating: 5,
    title: "She learned to balance in a week",
    body: "Lightweight enough for our daughter to carry herself. Seat adjustment is easy and the tires handle our sidewalk cracks fine.",
    date: "2026-02-18",
    verifiedPurchase: true,
  },
  {
    id: "r6",
    productSlug: "wooden-balance-bike",
    author: "Armen K.",
    rating: 4,
    title: "Great bike, assembly took a while",
    body: "Bike itself is excellent quality. Assembly instructions could be clearer but customer service in the shop walked me through it.",
    date: "2026-01-05",
    verifiedPurchase: true,
  },
  {
    id: "r7",
    productSlug: "organic-cotton-rattle-set",
    author: "Lilit H.",
    rating: 5,
    title: "Soft and safe",
    body: "Exactly what I wanted for a newborn gift — no plastic, no loud noises, just gentle textures and sound.",
    date: "2026-03-20",
    verifiedPurchase: true,
  },
  {
    id: "r8",
    productSlug: "first-wooden-puzzle-farm",
    author: "Gayane M.",
    rating: 5,
    title: "Perfect for 18 months",
    body: "Thick pieces are easy for tiny hands. My daughter can now name every animal!",
    date: "2026-02-27",
    verifiedPurchase: true,
  },
  {
    id: "r9",
    productSlug: "soft-plush-elephant",
    author: "Ani T.",
    rating: 5,
    title: "Machine washable is a lifesaver",
    body: "This has been dropped, drooled on, and washed at least ten times and still looks new.",
    date: "2026-01-30",
    verifiedPurchase: true,
  },
  {
    id: "r10",
    productSlug: "push-along-caterpillar",
    author: "Vahe D.",
    rating: 5,
    title: "Helped with first steps",
    body: "Handle height was perfect for our almost-one-year-old. Sturdy enough that it doesn't tip when he leans on it.",
    date: "2026-03-08",
    verifiedPurchase: true,
  },
];

export function getReviewsForProduct(slug: string) {
  return reviews.filter((r) => r.productSlug === slug);
}

export function getAverageRating(slug: string): number | null {
  const productReviews = getReviewsForProduct(slug);
  if (productReviews.length === 0) return null;
  const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
  return Math.round((total / productReviews.length) * 10) / 10;
}
