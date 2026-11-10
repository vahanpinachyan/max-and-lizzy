export interface Promotion {
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  ctaLabel: string;
  /**
   * For slides whose artwork already carries its own headline. The overlay
   * gradient and text are skipped and the whole slide becomes the link, so the
   * design is not printed over twice — and nothing is laid across the
   * characters' faces, which is what happens when a centred design meets a
   * left-aligned text block.
   */
  artworkOnly?: boolean;
}

export const promotions: Promotion[] = [
  {
    // Leads the carousel while the 11.11 sale runs. The artwork carries the
    // numbers only — "11.11" and "10%" read the same in all three languages —
    // so the copy below stays translatable instead of being baked into the JPEG.
    slug: "sale-11-11",
    title: "11.11 — 10% off everything",
    subtitle: "Ten percent off the whole catalogue until 13 November",
    image: "/images/promotions/sale-11-11-v3.jpg",
    href: "/shop",
    ctaLabel: "Shop the sale",
    artworkOnly: true,
  },
  {
    slug: "musical-toys",
    title: "New: Musical Toys",
    subtitle: "Xylophones, drums & mini instruments for tiny musicians",
    image: "/images/promotions/musical-toys-v1.jpg",
    href: "/shop/wooden-toys?sub=musical",
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
