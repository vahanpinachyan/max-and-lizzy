import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getServerDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/db";
import { getArcaOrderStatus, ARCA_ORDER_STATUS } from "@/lib/arca";
import { createOrderFromArcaPayment } from "@/lib/orders";
import { sendOrderConfirmationEmail, sendNewOrderNotificationEmail } from "@/lib/checkout-emails";
import { formatAmd } from "@/lib/format";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";

export const metadata: Metadata = { title: "Payment Status", robots: { index: false, follow: false } };

type ResultState = "paid" | "declined" | "unresolved";

// EPG has no server-to-server push callback documented in the merchant
// guide (see lib/arca.ts), so — unlike Idram's RESULT_URL — this page IS
// the source of truth: it's where we pull the authoritative status via
// getOrderStatusExtended.do and create the real Order record. Idempotent
// via createOrderFromArcaPayment, so refreshing this page is safe.
async function resolvePayment(ref: string | undefined): Promise<{ state: ResultState; totalAmd?: number }> {
  if (!ref) return { state: "unresolved" };

  const pending = await prisma.pendingArcaOrder.findUnique({ where: { id: ref } });
  if (!pending) return { state: "unresolved" };

  if (pending.status === "confirmed") return { state: "paid", totalAmd: pending.amountAmd };
  if (pending.status === "failed" || !pending.epgOrderId) return { state: "declined" };

  const status = await getArcaOrderStatus(pending.epgOrderId);
  if (!status || status.orderStatus === null) return { state: "unresolved" };

  if (status.orderStatus === ARCA_ORDER_STATUS.DECLINED) {
    await prisma.pendingArcaOrder.update({ where: { id: pending.id }, data: { status: "failed" } });
    return { state: "declined" };
  }
  if (status.orderStatus !== ARCA_ORDER_STATUS.DEPOSITED) {
    // Pre-authorized / reversed / refunded / still mid-authentication —
    // none of these should happen for a one-phase register.do payment, but
    // if one does, it isn't a confirmed payment, so don't create an order.
    return { state: "unresolved" };
  }

  // Defense in depth: this call is authenticated with our own merchant
  // credentials (not driven by anything the client supplied), but the
  // confirmed amount should still match what we asked for.
  const expectedMinor = pending.amountAmd * 100;
  if (status.amountMinor !== null && status.amountMinor !== expectedMinor) {
    console.error(`[arca] Amount mismatch for pending=${pending.id}: expected ${expectedMinor}, got ${status.amountMinor}`);
    return { state: "declined" };
  }

  const order = await createOrderFromArcaPayment(pending);
  await prisma.pendingArcaOrder.update({ where: { id: pending.id }, data: { status: "confirmed" } });
  await sendOrderConfirmationEmail(pending.customerEmail, order.id);
  await sendNewOrderNotificationEmail(order, pending.customerEmail);

  return { state: "paid", totalAmd: pending.amountAmd };
}

export default async function ArcaReturnPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const { dict: t, locale } = await getServerDictionary();
  const result = await resolvePayment(ref);

  if (result.state === "paid") {
    return (
      <Container className="max-w-2xl py-16 text-center">
        <ClearCartOnMount />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage-dark">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-espresso sm:text-4xl">{t.arcaResult.paidTitle}</h1>
        <p className="mt-3 text-espresso/70">{t.arcaResult.paidBody}</p>
        {typeof result.totalAmd === "number" && (
          <p className="mt-4 text-lg font-semibold text-espresso">{formatAmd(result.totalAmd, locale)}</p>
        )}
        <LinkButton href="/" className="mt-8">
          {t.arcaResult.backToHome}
        </LinkButton>
      </Container>
    );
  }

  if (result.state === "declined") {
    return (
      <Container className="max-w-2xl py-16 text-center">
        <h1 className="text-3xl font-bold text-espresso sm:text-4xl">{t.arcaResult.declinedTitle}</h1>
        <p className="mt-3 text-espresso/70">{t.arcaResult.declinedBody}</p>
        <LinkButton href="/cart" className="mt-8">
          {t.arcaResult.backToCart}
        </LinkButton>
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl py-16 text-center">
      <h1 className="text-3xl font-bold text-espresso sm:text-4xl">{t.arcaResult.unresolvedTitle}</h1>
      <p className="mt-3 text-espresso/70">{t.arcaResult.unresolvedBody}</p>
      <LinkButton href="/cart" className="mt-8">
        {t.arcaResult.backToCart}
      </LinkButton>
    </Container>
  );
}
