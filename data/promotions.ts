import type { Season } from "@/lib/season";

export interface Promotion {
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  // Optional artwork cut for the slide's shape on a phone. The wide image is
  // 3.2:1 and the phone slide is 1.44:1, so object-cover throws away more than
  // half its width — anything placed clear of the copy on a desktop is simply
  // gone. A slide without this keeps using `image` at both sizes.
  imageMobile?: string;
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
  /**
   * Optional season gate. A slide marked `christmas` is shown only while the
   * Christmas dressing is up, and disappears the moment CHRISTMAS_MODE is
   * switched off — which matters because such a slide points at
   * /shop/christmas, a route that only exists in season. Dates would have
   * worked too, but then the window would live in two places and could drift;
   * this way lib/season.ts stays the single source of truth.
   */
  season?: Season;
}

export const promotions: Promotion[] = [
  {
    // Leads the carousel for as long as the site is dressed for Christmas.
    // The artwork carries no words at all, so one pair of files serves all
    // three languages and only the copy below changes — and nothing in the
    // picture can go stale or contradict a price.
    //
    // It says nothing about an offer, a discount, a delivery date or gift
    // wrapping, because none of those have been confirmed. It is a pointer to
    // the collection, nothing more.
    slug: "christmas-collection",
    title: "Christmas Collection",
    subtitle: "Presents chosen by Max & Lizzy",
    image: "/images/promotions/christmas-collection-v1.jpg",
    // The wide painting keeps its left 55% as empty cream paper for the copy;
    // on a phone that empty area is most of the slide, so this cut moves the
    // scene down and right where the copy is not.
    imageMobile: "/images/promotions/christmas-collection-mobile-v1.jpg",
    href: "/shop/christmas",
    ctaLabel: "Shop the collection",
    season: "christmas",
  },
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
    // One mobile file for all three languages: it is just Max and Lizzy, with
    // none of the wording the wide artwork carries.
    imageMobile: "/images/promotions/sale-11-11-mobile-v1.jpg",
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
