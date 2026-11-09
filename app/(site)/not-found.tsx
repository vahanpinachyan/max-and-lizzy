import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { getServerDictionary } from "@/lib/i18n/server";

// Rendered inside the site layout, so the header, cart and footer stay put —
// a 404 should feel like a room in the shop you walked into by mistake, not
// like the site fell over. Replaces the stock black-on-white Next.js page.
export default async function SiteNotFound() {
  const { dict: t } = await getServerDictionary();

  return (
    <Container className="py-20 sm:py-28">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <Image
          src="/images/logo.png"
          alt=""
          width={96}
          height={96}
          className="h-24 w-24 opacity-80"
        />
        <p className="mt-8 font-heading text-6xl font-black text-tan sm:text-7xl">404</p>
        <h1 className="mt-4 font-heading text-3xl font-bold text-espresso sm:text-4xl">
          {t.errorPages.notFoundTitle}
        </h1>
        <p className="mt-4 text-espresso/70">{t.errorPages.notFoundBody}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
          >
            {t.errorPages.notFoundShop}
          </Link>
          <Link
            href="/"
            className="rounded-full border border-tan bg-cream px-6 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-beige"
          >
            {t.errorPages.notFoundHome}
          </Link>
        </div>

        <p className="mt-10 text-sm text-espresso/60">
          {t.errorPages.contactPrompt}{" "}
          <Link href="/contact" className="font-semibold text-terracotta-dark underline underline-offset-4">
            {t.errorPages.contactLink}
          </Link>
        </p>
      </div>
    </Container>
  );
}
