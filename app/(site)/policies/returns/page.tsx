import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = buildMetadata({
  title: "Returns & Exchanges",
  description: "Return and exchange policy for Max & Lizzy toys purchased online or in-store.",
  pathname: "/policies/returns",
});

export default function ReturnsPolicyPage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-4xl font-bold text-espresso">Returns &amp; Exchanges</h1>
      <p className="mt-2 text-sm text-espresso/70">Last updated: July 18, 2026</p>

      <div className="mt-8 space-y-6 text-espresso/80">
        <section>
          <h2 className="text-xl font-bold text-espresso">14-day returns</h2>
          <p className="mt-2">
            We want you and your child to love every toy from Max &amp; Lizzy. You may return
            unused, unopened items in original packaging within 14 days of purchase (or of
            delivery, for online orders) for a full refund or exchange. If you bought online,
            this window is also your legal right under Armenian consumer protection law — you
            don&apos;t need to give us a reason.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">How to return an item</h2>
          <p className="mt-2">
            Bring your item and proof of purchase (order confirmation email or receipt) to our
            store at 50 Mashtots Avenue during business hours. For online orders picked up via
            local delivery, please <a href="/contact" className="underline">contact us</a> first
            to arrange a return.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Damaged or defective items</h2>
          <p className="mt-2">
            If an item arrives damaged or defective, contact us within 7 days of receiving your
            order and we&apos;ll arrange a replacement or refund at no cost to you.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Non-returnable items</h2>
          <p className="mt-2">
            For hygiene reasons, opened bath toys, teethers, and plush items cannot be returned
            unless defective.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Refunds</h2>
          <p className="mt-2">
            Approved refunds are issued back to your original payment method — Telcell, Idram, or
            ArCa — and typically appear within 5–10 business days, depending on your bank or
            wallet provider.
          </p>
        </section>
      </div>
    </Container>
  );
}
