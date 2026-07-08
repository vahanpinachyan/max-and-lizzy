import type { Metadata } from "next";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description: `Get in touch with Max & Lizzy. Visit us at ${site.address.street}, ${site.address.city}, or send us a message.`,
  pathname: "/contact",
});

export default async function ContactPage() {
  const { dict: t } = await getServerDictionary();
  return (
    <Container className="py-12">
      <h1 className="text-4xl font-bold text-espresso sm:text-5xl">{t.contactPage.title}</h1>
      <p className="mt-3 max-w-2xl text-espresso/70">
        {t.contactPage.subtitle}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ContactForm />

        <aside className="space-y-6 rounded-2xl border border-tan/50 bg-white p-6 h-fit">
          <div>
            <h2 className="font-semibold text-espresso">{t.contactPage.visit}</h2>
            <address className="mt-1 not-italic text-sm text-espresso/70">
              {site.address.street}
              <br />
              {site.address.city}, {site.address.country}
            </address>
          </div>
          <div>
            <h2 className="font-semibold text-espresso">{t.contactPage.phone}</h2>
            <p className="mt-1 text-sm text-espresso/70">
              {site.phone === "TBD" ? t.contactPage.comingSoon : <a href={site.phoneHref} className="hover:text-terracotta-dark">{site.phone}</a>}
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-espresso">{t.contactPage.email}</h2>
            <p className="mt-1 text-sm text-espresso/70">
              {site.email === "TBD" ? t.contactPage.comingSoon : <a href={`mailto:${site.email}`} className="hover:text-terracotta-dark">{site.email}</a>}
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-espresso">{t.contactPage.hours}</h2>
            <p className="mt-1 text-sm text-espresso/70">{t.contactPage.hoursValue}</p>
          </div>
          <div>
            <h2 className="font-semibold text-espresso">{t.contactPage.followUs}</h2>
            <div className="mt-2 flex gap-3 text-sm">
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="text-terracotta-dark hover:underline">
                {t.contactPage.instagram}
              </a>
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="text-terracotta-dark hover:underline">
                {t.contactPage.facebook}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
