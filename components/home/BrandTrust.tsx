import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionDecorations } from "@/components/ui/Decorations";
import { getServerDictionary } from "@/lib/i18n/server";

const LOGO_SRC: Record<string, string | undefined> = {
  GOKI: "/images/brands/goki.png",
  Nattou: "/images/brands/nattou.png",
  Holztiger: "/images/brands/holztiger.png",
};

export async function BrandTrust() {
  const { dict: t } = await getServerDictionary();
  return (
    <section className="relative overflow-hidden bg-sage/10 py-16">
      <SectionDecorations variant="clouds" />
      <Container className="relative">
        <SectionHeading
          align="center"
          eyebrow={t.home.brandTrustEyebrow}
          title={t.home.brandTrustTitle}
          description={t.home.brandTrustSubtitle}
        />
        <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-center gap-8 sm:flex-row sm:gap-0">
          {t.brands.map((brand) => {
            const logoSrc = LOGO_SRC[brand.name];
            return (
              <div
                key={brand.name}
                className="flex flex-1 flex-col items-center gap-2 px-8 sm:border-l sm:border-espresso/10 sm:first:border-l-0"
              >
                {logoSrc ? (
                  <div className="relative h-14 w-32">
                    <Image src={logoSrc} alt={brand.name} fill className="object-contain" sizes="128px" />
                  </div>
                ) : (
                  <span className="font-heading text-2xl font-bold tracking-wide text-espresso">
                    {brand.name}
                  </span>
                )}
                <span className="text-xs font-semibold uppercase tracking-wider text-espresso/50">
                  {brand.origin}
                </span>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
