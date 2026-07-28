import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Payment Failed", robots: { index: false, follow: false } };

export default function IdramFailPage() {
  return (
    <Container className="max-w-2xl py-16 text-center">
      <h1 className="text-3xl font-bold text-espresso sm:text-4xl">Payment didn&apos;t go through</h1>
      <p className="mt-3 text-espresso/70">Your Idram payment wasn&apos;t completed. No charge was made — please try again.</p>
      <LinkButton href="/cart" className="mt-8">
        Back to cart
      </LinkButton>
    </Container>
  );
}
