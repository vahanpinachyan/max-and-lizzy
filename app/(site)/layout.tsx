import type { Metadata } from "next";
import "../globals.css";
import { site } from "@/data/site";
import { CartProvider } from "@/lib/cart-context";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { WishlistDrawer } from "@/components/layout/WishlistDrawer";
import { Footer } from "@/components/layout/Footer";
import { WelcomeModal } from "@/components/marketing/WelcomeModal";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/seo";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { OmnisendSnippet } from "@/components/marketing/OmnisendSnippet";
import { PostHogInit } from "@/components/marketing/PostHogInit";
import { ScrollToTopOnNavigate } from "@/components/layout/ScrollToTopOnNavigate";
import { I18nProvider } from "@/lib/i18n/context";
import { getLocale } from "@/lib/i18n/server";
import { FontPreloads } from "@/components/layout/FontPreloads";

// Type system: Bitter (a confident slab serif — its sturdy serif "feet"
// echo the geometry of the actual product, chunky wooden blocks and
// stacking toys) for headlines, paired with Golos Text (a clean modern
// grotesk) for body copy. Armenian has no distinctive-font options on
// Google Fonts (only Noto + a couple of unsuitable display faces), so it
// gets the best-available pairing — Noto Serif/Sans Armenian — matched to
// the same serif/sans split so switching languages doesn't feel like a
// different brand. See globals.css for the :lang(hy) overrides.
//
// The faces themselves are vendored in public/fonts and declared in
// app/fonts.css, which also defines --font-bitter and friends; they used to
// come from next/font/google, which downloaded them from Google on every
// build and failed roughly one build in four.

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Wooden & Eco-Friendly Toys in Yerevan`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "wooden toys Yerevan",
    "educational toys Armenia",
    "eco-friendly toys",
    "wooden toys for kids",
    "Montessori toys Armenia",
    "toy store Yerevan",
    "baby toys Armenia",
    "toddler toys Yerevan",
    "Max & Lizzy",
  ],
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className="fonts-site h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <FontPreloads locale={locale} />
        <JsonLd data={organizationJsonLd()} />
        <GoogleAnalytics />
        <OmnisendSnippet />
        <PostHogInit />
        <ScrollToTopOnNavigate />
        <I18nProvider locale={locale}>
          <CartProvider>
            <Header />
            <AnnouncementBar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <WishlistDrawer />
            <WelcomeModal />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
