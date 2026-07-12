import type { Metadata } from "next";
import Link from "next/link";
import { getStripe } from "@/lib/stripe";
import { formatAmd } from "@/lib/format";
import { site } from "@/data/site";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Order Confirmed", robots: { index: false, follow: false } };

async function getSessionSummary(sessionId: string) {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    return session;
  } catch (error) {
    console.error("[checkout/success] Unable to retrieve session:", error);
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const session = sessionId ? await getSessionSummary(sessionId) : null;
  const { dict: t, locale } = await getServerDictionary();

  // The Stripe webhook creates our Order record asynchronously, so it may
  // not exist yet when this page loads right after checkout — that's fine,
  // the review link just doesn't render that one time (customers can still
  // review later via the order-completed email).
  const order = sessionId
    ? await prisma.order.findUnique({ where: { stripeSessionId: sessionId } })
    : null;

  return (
    <Container className="max-w-2xl py-16 text-center">
      <ClearCartOnMount />
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage-dark">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-bold text-espresso sm:text-4xl">{t.checkoutSuccess.title}</h1>
      <p className="mt-3 text-espresso/70">
        {session ? t.checkoutSuccess.bodyWithSession : t.checkoutSuccess.bodyNoSession}
      </p>

      {session && (
        <div className="mt-8 rounded-2xl border border-tan/50 bg-white p-6 text-left">
          <div className="flex justify-between text-sm text-espresso/70">
            <span>{t.checkoutSuccess.orderReference}</span>
            <span className="font-mono">{session.id.slice(-12)}</span>
          </div>
          {typeof session.amount_total === "number" && (
            <div className="mt-2 flex justify-between font-semibold text-espresso">
              <span>{t.checkoutSuccess.totalPaid}</span>
              <span>{formatAmd(session.amount_total / 100, locale)}</span>
            </div>
          )}
          {session.customer_details?.email && (
            <div className="mt-2 flex justify-between text-sm text-espresso/70">
              <span>{t.checkoutSuccess.sentTo}</span>
              <span>{session.customer_details.email}</span>
            </div>
          )}
        </div>
      )}

      <p className="mt-8 text-sm text-espresso/70">
        {t.checkoutSuccess.questionsNote}{" "}
        <a href={`mailto:${site.email}`} className="underline">{site.email}</a> {t.checkoutSuccess.orVisitUsAt}{" "}
        {site.address.street}.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/shop">{t.checkoutSuccess.continueShopping}</LinkButton>
        {order && (
          <LinkButton href={`/orders/${order.id}/review`} variant="outline">
            {t.product.leaveAReview}
          </LinkButton>
        )}
      </div>
      <p className="mt-4">
        <Link href="/" className="text-sm text-espresso/70 underline">
          {t.checkoutSuccess.backToHome}
        </Link>
      </p>
    </Container>
  );
}
