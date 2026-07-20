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
    slug: "musical-toys",
    title: "New: Musical Toys",
    subtitle: "Xylophones, drums & mini instruments for tiny musicians",
    image: "/images/promotions/musical-toys-v1.jpg",
    href: "/shop/wooden-toys",
    ctaLabel: "Shop Musical Toys",
  },
  {
    slug: "wooden-play-collection",
    title: "Gifts Under 15,000 AMD",
    subtitle: "Thoughtful presents for growing imaginations",
    image: "/images/promotions/wooden-play-collection-v1.jpg",
    href: "/blog/best-wooden-toys-for-1-year-olds",
    ctaLabel: "See The Guide",
  },
  {
    slug: "outdoor-play-season",
    title: "Timeless Wooden Toys",
    subtitle: "Stacking, building & imaginative play, made to last",
    image: "/images/promotions/outdoor-play-season-v2.jpg",
    href: "/shop/wooden-toys",
    ctaLabel: "Shop Wooden Toys",
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
