import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Payment Successful", robots: { index: false, follow: false } };

// Idram redirects the customer's browser here after a successful payment —
// this is purely a UX confirmation. The actual source of truth for whether
// the payment happened is the server-to-server RESULT_URL callback
// (app/api/idram/callback/route.ts), not this page, so nothing here needs
// to look anything up.
export default function IdramSuccessPage() {
  return (
    <Container className="max-w-2xl py-16 text-center">
      <h1 className="text-3xl font-bold text-espresso sm:text-4xl">Payment successful</h1>
      <p className="mt-3 text-espresso/70">Thank you — your Idram payment went through.</p>
      <LinkButton href="/" className="mt-8">
        Back to home
      </LinkButton>
    </Container>
  );
}
