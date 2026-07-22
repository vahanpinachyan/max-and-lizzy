// Central business/config data. Update these values with real business
// details before launch — see README.md "Before you launch" checklist.

// Matches the verified Google Business Profile listing exactly ("Max &
// Lizzy Toys", 5.0 stars) — used for both the embedded map and the "Get
// directions" link so both reliably resolve to the real store rather than
// a geocoded guess at a bare street address (which was landing several km
// away, near Tsitsernakaberd, before this fix).
const GOOGLE_MAPS_QUERY = "Max & Lizzy Toys, 50 Mesrop Mashtots Avenue, Yerevan 0009, Armenia";

export const site = {
  name: "Max & Lizzy",
  tagline: "Educational, wooden & eco-friendly toys",
  description:
    "Max & Lizzy is a Yerevan toy store specializing in educational, wooden, and eco-friendly toys for babies and preschoolers. Visit us on Mashtots Avenue or shop online.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://maxandlizzy.com",
  address: {
    street: "50 Mesrop Mashtots Avenue",
    city: "Yerevan",
    region: "Yerevan",
    postalCode: "0009",
    country: "Armenia",
    countryCode: "AM",
  },
  phone: "+374 33 09 50 50",
  phoneHref: "tel:+37433095050",
  email: "info@maxandlizzy.com",
  // TODO: fill in registration number, tax/VAT ID, and legal address before
  // launch — see /policies/terms, which currently carries the same TODO.
  legalName: "Baby Land LLC",
  legalNameHy: "«Բեյբի Լենդ» ՍՊԸ",
  legalRegistrationNumber: "", // TODO
  legalTaxId: "", // TODO
  hours: [
    { day: "Monday", hours: "10:00 AM – 9:00 PM" },
    { day: "Tuesday", hours: "10:00 AM – 9:00 PM" },
    { day: "Wednesday", hours: "10:00 AM – 9:00 PM" },
    { day: "Thursday", hours: "10:00 AM – 9:00 PM" },
    { day: "Friday", hours: "10:00 AM – 9:00 PM" },
    { day: "Saturday", hours: "10:00 AM – 9:00 PM" },
    { day: "Sunday", hours: "10:00 AM – 9:00 PM" },
  ],
  hoursOpeningSpec: "Mo-Su 10:00-21:00", // schema.org / Google format
  geo: {
    latitude: 40.1892633,
    longitude: 44.518151,
  },
  social: {
    instagram: "https://www.instagram.com/max_and_lizzy_toys/?hl=en",
    facebook: "https://www.facebook.com/Maxandlizzy/",
  },
  currency: "AMD",
  locale: "en-US",
  googleMapsEmbedSrc: `https://www.google.com/maps?q=${encodeURIComponent(GOOGLE_MAPS_QUERY)}&output=embed`,
  googleMapsQuery: GOOGLE_MAPS_QUERY,
  ageRanges: ["0-3", "3-6"] as const,
} as const;

// Short rolling announcement messages (keep each under ~10 words).
export const announcements = [
  "Free pickup at our Yerevan store on every order",
  "Safety-tested, eco-friendly toys for ages 0–6",
  "Local delivery available across Yerevan",
  "New arrivals added to Wooden Toys every month",
] as const;

export const NAV_CATEGORIES = [
  "educational",
  "wooden-toys",
  "outdoor-play",
  "puzzles-games",
  "baby-toddler",
] as const;
