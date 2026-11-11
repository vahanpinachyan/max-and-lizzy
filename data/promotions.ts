export interface Promotion {
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  ctaLabel: string;
  /**
   * Optional run dates, YYYY-MM-DD in shop time. A slide outside its window is
   * not rendered at all, so a dated campaign takes itself down instead of
   * sitting on the homepage advertising a discount that has expired — which
   * matters most when the end date is printed inside the artwork and cannot be
   * edited away. endsOn is inclusive: "2026-11-13" runs through all of the 13th.
   */
  startsOn?: string;
  endsOn?: string;
}

export const promotions: Promotion[] = [
  {
    // Leads the carousel while the 11.11 sale runs. Unlike the other slides
    // this one has words inside the artwork ("OFF STOREWIDE", the validity
    // date), so there is a JPEG per language: this English one is also what
    // Russian visitors see, since no Russian artwork was made and English
    // reads closer than Armenian for them. See localizePromotions.
    slug: "sale-11-11",
    title: "11.11 Sale: 10% off everything",
    subtitle: "Ten percent off the whole catalogue until 13 November",
    image: "/images/promotions/sale-11-11-en-v1.jpg",
    href: "/shop",
    ctaLabel: "Visit the store",
    startsOn: "2026-11-11",
    endsOn: "2026-11-13",
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
