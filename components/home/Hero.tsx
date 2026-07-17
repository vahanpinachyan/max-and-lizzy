import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { Cloud, Flower } from "@/components/ui/Decorations";
import { getServerDictionary } from "@/lib/i18n/server";

export async function Hero() {
  const { dict: t } = await getServerDictionary();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-beige to-tan/60">
      {/* Very light, decorative clouds and flowers — a soft kid-friendly texture, not focal content. */}
      <Cloud className="pointer-events-none absolute left-[8%] top-10 h-auto w-28 opacity-40 sm:w-36" />
      <Cloud className="animate-float-slow-reverse pointer-events-none absolute right-[18%] top-6 h-auto w-20 opacity-30 sm:w-28" />
      <Cloud className="animate-float-slow pointer-events-none absolute left-[38%] top-20 h-auto w-16 opacity-20 sm:w-20" />
      <Cloud className="pointer-events-none absolute right-[4%] top-1/2 h-auto w-24 opacity-20 sm:w-28" />
      <Flower className="pointer-events-none absolute left-[22%] bottom-10 h-auto w-8 opacity-20 sm:w-10" />
      <Flower className="pointer-events-none absolute left-[6%] bottom-24 h-auto w-6 rotate-12 opacity-15" />
      <Flower className="pointer-events-none absolute right-[8%] bottom-16 h-auto w-7 -rotate-6 opacity-20" />
      <Flower className="pointer-events-none absolute right-[28%] bottom-6 h-auto w-5 rotate-45 opacity-15" />

      <Container className="relative grid min-w-0 items-center gap-10 py-14 lg:grid-cols-2 lg:py-24">
        <div className="min-w-0">
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-sage/15 px-4 py-1.5 text-sm font-semibold text-sage-dark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2 C 8 6, 6 9, 6 13 A6 6 0 0 0 18 13 C18 9, 16 6, 12 2 Z" />
            </svg>
            {t.hero.eyebrow}
          </p>
          <h1 className="break-words text-5xl leading-[1.05] font-bold text-espresso sm:text-6xl lg:text-7xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-lg text-lg text-espresso/75">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton href="/shop" size="lg">
              {t.hero.shopAll}
            </LinkButton>
            <LinkButton href="/visit-us" variant="outline" size="lg">
              {t.hero.visitStore}
            </LinkButton>
          </div>
        </div>

        <div className="relative flex min-w-0 justify-center lg:justify-end">
          <div className="relative aspect-square w-full max-w-[28rem] sm:max-w-[34rem] lg:max-w-[40rem]">
            <Image
              src="/images/hero-maxlizzy-transparent-v1.png"
              alt="Illustrated portraits of Max and Lizzy, the two children the store is named for"
              fill
              priority
              quality={95}
              className="object-contain"
              sizes="(min-width: 1024px) 45vw, 90vw"
            />
          </div>
        </div>
      </Container>

      <WaveDivider color="var(--color-cream)" />
    </section>
  );
}
