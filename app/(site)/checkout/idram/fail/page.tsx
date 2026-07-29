import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Payment Failed", robots: { index: false, follow: false } };

export default async function IdramFailPage() {
  const { dict: t } = await getServerDictionary();
  return (
    <Container className="max-w-2xl py-16 text-center">
      <h1 className="text-3xl font-bold text-espresso sm:text-4xl">{t.idramFail.title}</h1>
      <p className="mt-3 text-espresso/70">{t.idramFail.body}</p>
      <LinkButton href="/cart" className="mt-8">
        {t.idramFail.backToCart}
      </LinkButton>
    </Container>
  );
}
