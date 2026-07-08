import type { Metadata } from "next";
import { site } from "@/data/site";
import type { Product, BlogPost } from "@/types";
import { getAverageRating, getReviewsForProduct } from "@/data/reviews";

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, site.url).toString();
}

export function buildMetadata({
  title,
  description,
  pathname,
  image,
  noIndex,
}: {
  title: string;
  description: string;
  pathname: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(pathname);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: "website",
      locale: "en_US",
      images: image ? [{ url: absoluteUrl(image) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [absoluteUrl(image)] : undefined,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: absoluteUrl("/images/logo.svg"),
    sameAs: [site.social.instagram, site.social.facebook],
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ToyStore",
    name: site.name,
    image: absoluteUrl("/images/store/storefront-exterior.svg"),
    url: site.url,
    telephone: site.phone !== "TBD" ? site.phone : undefined,
    email: site.email !== "TBD" ? site.email : undefined,
    priceRange: "AMD",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    openingHoursSpecification: site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day,
      opens: "10:00",
      closes: "21:00",
    })),
    sameAs: [site.social.instagram, site.social.facebook],
  };
}

export function productJsonLd(product: Product) {
  const avgRating = getAverageRating(product.slug);
  const reviewCount = getReviewsForProduct(product.slug).length;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    image: product.images.map((img) => absoluteUrl(img.src)),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "AMD",
      price: product.priceAmd,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(avgRating && reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount,
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogPostJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    image: absoluteUrl(post.coverImage),
    author: { "@type": "Organization", name: post.author },
    datePublished: post.date,
    url: absoluteUrl(`/blog/${post.slug}`),
  };
}
