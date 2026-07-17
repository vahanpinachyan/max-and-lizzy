import Link from "next/link";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { PaymentLogos } from "@/components/layout/PaymentLogos";
import { getServerDictionary } from "@/lib/i18n/server";
import { localizeCategories } from "@/lib/i18n/localize-data";

export async function Footer() {
  const { dict: t, locale } = await getServerDictionary();
  const categories = localizeCategories(locale);
  return (
    <footer className="mt-24 bg-espresso text-cream">
      <Container className="py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="font-heading text-2xl font-bold">{site.name}</p>
            <p className="mt-3 max-w-xs text-sm text-cream/70">{site.description}</p>
            <div className="mt-5 flex gap-3">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.footer.instagramAria}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 hover:bg-terracotta"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" strokeWidth="2" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </a>
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.footer.facebookAria}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 hover:bg-terracotta"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path
                    d="M14 9h3V6h-3c-1.66 0-3 1.34-3 3v2H9v3h2v6h3v-6h3l1-3h-4V9c0-.55.45-1 1-1z"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>

          <nav aria-label={t.footer.shopCategoriesAria}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-cream/60">{t.footer.shop}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/shop/${cat.slug}`} className="text-cream/80 hover:text-terracotta">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.companyAria}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-cream/60">{t.footer.company}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="text-cream/80 hover:text-terracotta">{t.footer.aboutUs}</Link></li>
              <li><Link href="/visit-us" className="text-cream/80 hover:text-terracotta">{t.footer.visitUs}</Link></li>
              <li><Link href="/blog" className="text-cream/80 hover:text-terracotta">{t.footer.blog}</Link></li>
              <li><Link href="/contact" className="text-cream/80 hover:text-terracotta">{t.footer.contact}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t.footer.policiesAria}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-cream/60">{t.footer.policies}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/policies/shipping" className="text-cream/80 hover:text-terracotta">{t.footer.shipping}</Link></li>
              <li><Link href="/policies/returns" className="text-cream/80 hover:text-terracotta">{t.footer.returns}</Link></li>
              <li><Link href="/policies/privacy" className="text-cream/80 hover:text-terracotta">{t.footer.privacy}</Link></li>
              <li><Link href="/policies/terms" className="text-cream/80 hover:text-terracotta">{t.footer.terms}</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-cream/15 pt-10">
          <NewsletterForm variant="footer" />
        </div>

        <div className="mt-10 border-t border-cream/15 pt-6">
          <PaymentLogos label={t.footer.weAccept} />
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-cream/15 pt-6 text-sm text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <address className="not-italic">
            {site.address.street}, {site.address.city}, {site.address.country}
            {" · "}
            <a href={site.phoneHref} className="hover:text-terracotta">{site.phone}</a>
          </address>
          <p>© {new Date().getFullYear()} {site.legalName}. {t.footer.rightsReserved}</p>
        </div>
      </Container>
    </footer>
  );
}
