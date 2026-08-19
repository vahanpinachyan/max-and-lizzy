import type { Metadata } from "next";
import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getServerDictionary } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/interpolate";
import { prisma } from "@/lib/db";
import { getArcaOrderStatus, ARCA_ORDER_STATUS } from "@/lib/arca";
import { createOrderFromArcaPayment } from "@/lib/orders";
import { sendNewOrderNotificationEmail } from "@/lib/checkout-emails";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import type { OrderItem } from "@prisma/client";

export const metadata: Metadata = { title: "Payment Status", robots: { index: false, follow: false } };

type ResultState = "paid" | "declined" | "unresolved";
interface ResolvedPayment {
  state: ResultState;
  items?: OrderItem[];
  customerEmail?: string;
}

// EPG has no server-to-server push callback documented in the merchant
// guide (see lib/arca.ts), so — unlike Idram's RESULT_URL — this page IS
// the source of truth: it's where we pull the authoritative status via
// getOrderStatusExtended.do and create the real Order record. Idempotent
// via createOrderFromArcaPayment, so refreshing this page is safe.
async function resolvePayment(ref: string | undefined): Promise<ResolvedPayment> {
  if (!ref) return { state: "unresolved" };

  const pending = await prisma.pendingArcaOrder.findUnique({ where: { id: ref } });
  if (!pending) return { state: "unresolved" };

  if (pending.status === "confirmed") {
    const order = await prisma.order.findUnique({ where: { arcaOrderId: pending.id }, include: { items: true } });
    return { state: "paid", items: order?.items ?? [], customerEmail: pending.customerEmail };
  }
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
  await sendNewOrderNotificationEmail(order, pending.customerEmail);

  return { state: "paid", items: order.items, customerEmail: pending.customerEmail };
}

export default async function ArcaReturnPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const { dict: t } = await getServerDictionary();
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

        {result.items && result.items.length > 0 && (
          <div className="mt-8 rounded-2xl border border-tan/50 bg-white p-4 text-left">
            <p className="text-sm font-semibold text-espresso">{t.arcaResult.orderItemsLabel}</p>
            <ul className="mt-3 divide-y divide-tan/40">
              {result.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-beige">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="48px" />
                    )}
                  </div>
                  <span className="flex-1 text-sm text-espresso">{item.productName}</span>
                  <span className="text-sm text-espresso/70">×{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.customerEmail && (
          <p className="mt-4 text-sm text-espresso/70">
            {interpolate(t.arcaResult.confirmationEmailNote, { email: result.customerEmail })}
          </p>
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/15 text-terracotta-dark">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-espresso sm:text-4xl">{t.arcaResult.declinedTitle}</h1>
        <p className="mt-3 text-espresso/70">{t.arcaResult.declinedBody}</p>
        <LinkButton href="/cart" className="mt-8">
          {t.arcaResult.backToCart}
        </LinkButton>
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-beige text-espresso/70">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M12 8v5l3 2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="9" strokeWidth="2" />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-bold text-espresso sm:text-4xl">{t.arcaResult.unresolvedTitle}</h1>
      <p className="mt-3 text-espresso/70">{t.arcaResult.unresolvedBody}</p>
      <LinkButton href="/cart" className="mt-8">
        {t.arcaResult.backToCart}
      </LinkButton>
    </Container>
  );
}
