export interface Promotion {
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  ctaLabel: string;
}

export const promotions: Promotion[] = [
  {
    slug: "new-stem-arrivals",
    title: "New: STEM Building Sets",
    subtitle: "Magnetic tiles, marble runs & more for curious builders",
    image: "/images/promotions/new-stem-arrivals.jpg",
    href: "/shop/educational",
    ctaLabel: "Shop Educational",
  },
  {
    slug: "gift-guide-under-15000",
    title: "Gifts Under 15,000 AMD",
    subtitle: "Thoughtful presents that don't break the bank",
    image: "/images/promotions/gift-guide-under-15000.jpg",
    href: "/blog/best-wooden-toys-for-1-year-olds",
    ctaLabel: "See The Guide",
  },
  {
    slug: "outdoor-play-season",
    title: "Ready for Outdoor Play",
    subtitle: "Balance bikes, sand & water tables for sunny days",
    image: "/images/promotions/outdoor-play-season.jpg",
    href: "/shop/outdoor-play",
    ctaLabel: "Shop Outdoor Play",
  },
  {
    slug: "visit-yerevan-store",
    title: "Visit Us on Mashtots Avenue",
    subtitle: "See and try every toy in person, open daily",
    image: "/images/promotions/visit-yerevan-store.jpg",
    href: "/visit-us",
    ctaLabel: "Get Directions",
  },
];
