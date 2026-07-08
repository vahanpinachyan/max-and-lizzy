import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/data/site";
import { buildMetadata, localBusinessJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = buildMetadata({
  title: "Visit Us",
  description: `Visit Max & Lizzy at ${site.address.street}, ${site.address.city}. Open daily 10am–9pm. Get directions, parking info, and store hours.`,
  pathname: "/visit-us",
});

const STORE_PHOTOS = [
  { src: "/images/store/storefront-exterior.svg", alt: "Max & Lizzy storefront exterior on Mashtots Avenue" },
  { src: "/images/store/shop-interior.svg", alt: "Inside the Max & Lizzy toy shop" },
  { src: "/images/store/toy-shelf-display.svg", alt: "Wooden toy display shelves inside the shop" },
  { src: "/images/store/checkout-counter.svg", alt: "Checkout counter at Max & Lizzy" },
];

export default function VisitUsPage() {
  return (
    <Container className="py-12">
      <JsonLd data={localBusinessJsonLd()} />
      <h1 className="text-4xl font-bold text-espresso sm:text-5xl">Visit Our Store</h1>
      <p className="mt-3 max-w-2xl text-espresso/70">
        We love meeting the families who shop with us. Come see, touch, and try the toys in
        person — our team is always on hand to help you find the right fit.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-tan/50">
            <iframe
              title={`Map showing ${site.name} location at ${site.address.street}`}
              src={site.googleMapsEmbedSrc}
              width="100%"
              height="360"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block"
            />
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              `${site.address.street}, ${site.address.city}, ${site.address.country}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-semibold text-terracotta-dark hover:underline"
          >
            Get directions →
          </a>
        </div>

        <div className="space-y-8">
          <section aria-labelledby="address-heading">
            <h2 id="address-heading" className="text-lg font-bold text-espresso">
              Address
            </h2>
            <address className="mt-2 not-italic text-espresso/80">
              {site.address.street}
              <br />
              {site.address.city}, {site.address.country}
            </address>
          </section>

          <section aria-labelledby="hours-heading">
            <h2 id="hours-heading" className="text-lg font-bold text-espresso">
              Hours
            </h2>
            <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm text-espresso/80 max-w-xs">
              {site.hours.map((h) => (
                <div key={h.day} className="contents">
                  <dt className="font-medium">{h.day}</dt>
                  <dd>{h.hours}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-lg font-bold text-espresso">
              Contact
            </h2>
            <p className="mt-2 text-espresso/80">
              Phone:{" "}
              {site.phone === "TBD" ? (
                <span className="text-espresso/70">Coming soon</span>
              ) : (
                <a href={site.phoneHref} className="hover:text-terracotta-dark">{site.phone}</a>
              )}
            </p>
            <p className="mt-1 text-espresso/80">
              Email:{" "}
              {site.email === "TBD" ? (
                <span className="text-espresso/70">Coming soon</span>
              ) : (
                <a href={`mailto:${site.email}`} className="hover:text-terracotta-dark">{site.email}</a>
              )}
            </p>
          </section>

          <section aria-labelledby="parking-heading">
            <h2 id="parking-heading" className="text-lg font-bold text-espresso">
              Parking &amp; Directions
            </h2>
            <p className="mt-2 text-espresso/80">
              {/* Placeholder — replace with real parking/access details */}
              Street parking is available along Mashtots Avenue, with additional parking on
              nearby side streets. The shop is a short walk from local public transit stops
              along the avenue.
            </p>
          </section>
        </div>
      </div>

      <section className="mt-16" aria-labelledby="photos-heading">
        <h2 id="photos-heading" className="text-2xl font-bold text-espresso">
          Inside the Shop
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STORE_PHOTOS.map((photo) => (
            <div key={photo.src} className="relative aspect-square overflow-hidden rounded-2xl">
              <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(min-width: 1024px) 25vw, 50vw" />
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
