import type { Metadata } from "next";
import { Bitter, Golos_Text, Noto_Serif_Armenian, Noto_Sans_Armenian } from "next/font/google";
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
import { I18nProvider } from "@/lib/i18n/context";
import { getLocale } from "@/lib/i18n/server";

// Type system: Bitter (a confident slab serif — its sturdy serif "feet"
// echo the geometry of the actual product, chunky wooden blocks and
// stacking toys) for headlines, paired with Golos Text (a clean modern
// grotesk) for body copy. Armenian has no distinctive-font options on
// Google Fonts (only Noto + a couple of unsuitable display faces), so it
// gets the best-available pairing — Noto Serif/Sans Armenian — matched to
// the same serif/sans split so switching languages doesn't feel like a
// different brand. See globals.css for the :lang(hy) overrides.
const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["700", "800", "900"],
});

const golosText = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const notoSerifArmenian = Noto_Serif_Armenian({
  variable: "--font-noto-serif-armenian",
  subsets: ["armenian", "latin"],
  weight: ["700", "800", "900"],
});

const notoSansArmenian = Noto_Sans_Armenian({
  variable: "--font-noto-sans-armenian",
  subsets: ["armenian", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Educational, Wooden & Eco-Friendly Toys in Yerevan`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
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
      className={`${bitter.variable} ${golosText.variable} ${notoSerifArmenian.variable} ${notoSansArmenian.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={organizationJsonLd()} />
        <GoogleAnalytics />
        <OmnisendSnippet />
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
