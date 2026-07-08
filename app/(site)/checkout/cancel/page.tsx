import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Checkout Cancelled", robots: { index: false, follow: false } };

export default async function CheckoutCancelPage() {
  const { dict: t } = await getServerDictionary();
  return (
    <Container className="max-w-2xl py-16 text-center">
      <h1 className="text-3xl font-bold text-espresso sm:text-4xl">{t.checkoutCancel.title}</h1>
      <p className="mt-3 text-espresso/70">
        {t.checkoutCancel.body}
      </p>
      <LinkButton href="/cart" className="mt-8">
        {t.checkoutCancel.returnToCart}
      </LinkButton>
      <p className="mt-4">
        <Link href="/shop" className="text-sm text-espresso/70 underline">
          {t.checkoutCancel.continueShopping}
        </Link>
      </p>
    </Container>
  );
}
