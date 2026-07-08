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

        <div className="relative min-w-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] shadow-xl">
            <Image
              src="/images/hero-home.svg"
              alt="Collection of educational wooden toys including stacking arches and building blocks"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden max-w-[12rem] items-center gap-2 rounded-2xl border border-tan/60 bg-white/55 px-4 py-3 shadow-lg backdrop-blur-md sm:flex">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage-dark)" className="shrink-0" aria-hidden="true">
              <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-semibold leading-tight text-espresso break-words">
              {t.hero.trustBadge}
            </span>
          </div>
        </div>
      </Container>

      <WaveDivider color="var(--color-cream)" />
    </section>
  );
}
