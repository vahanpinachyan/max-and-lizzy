import type { Metadata } from "next";
import Image from "next/image";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "Learn the story behind Max & Lizzy, our mission to bring safe, educational, eco-friendly toys to families in Yerevan, and why we care about what kids play with.",
  pathname: "/about",
});

export default async function AboutPage() {
  const { dict: t } = await getServerDictionary();
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-sage-dark">{t.aboutPage.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-bold text-espresso sm:text-5xl">{t.aboutPage.title}</h1>
        <p className="mt-5 text-lg text-espresso/75">{t.aboutPage.intro}</p>
      </div>

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="/images/about-story.jpg"
            alt={t.aboutPage.storyImageAlt}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-espresso">{t.aboutPage.whyTitle}</h2>
          <p className="mt-4 text-espresso/80">{t.aboutPage.whyParagraph1}</p>
          <p className="mt-4 text-espresso/80">{t.aboutPage.whyParagraph2}</p>
        </div>
      </div>

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <h2 className="text-2xl font-bold text-espresso">{t.aboutPage.teamTitle}</h2>
          <p className="mt-4 text-espresso/80">{t.aboutPage.teamParagraph}</p>
        </div>
        <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-3xl lg:order-2">
          <Image
            src="/images/about-team.jpg"
            alt={t.aboutPage.teamImageAlt}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>

      <div className="mt-16 rounded-3xl bg-sage/10 p-10 text-center">
        <h2 className="text-2xl font-bold text-espresso">{t.aboutPage.visitTitle}</h2>
        <p className="mt-3 text-espresso/75">{t.aboutPage.visitParagraph}</p>
        <LinkButton href="/visit-us" className="mt-6">
          {t.nav.visitUs}
        </LinkButton>
      </div>
    </Container>
  );
}
