import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = buildMetadata({
  title: "Shipping Policy",
  description: "Shipping, pickup, and local delivery information for Max & Lizzy orders in Yerevan.",
  pathname: "/policies/shipping",
});

export default function ShippingPolicyPage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-4xl font-bold text-espresso">Shipping &amp; Delivery Policy</h1>
      <p className="mt-2 text-sm text-espresso/70">Last updated: placeholder — update before launch</p>

      <div className="prose-content mt-8 space-y-6 text-espresso/80">
        <section>
          <h2 className="text-xl font-bold text-espresso">In-store pickup</h2>
          <p className="mt-2">
            Every online order can be picked up free of charge at our store, {" "}
            <strong>50 Mashtots Avenue, Yerevan</strong>, during regular business hours
            (10:00 AM – 9:00 PM daily). Choose &quot;Pickup&quot; at checkout and we&apos;ll have
            your order ready — we&apos;ll contact you using the phone number or email provided
            once it&apos;s prepared.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Local delivery (Yerevan)</h2>
          <p className="mt-2">
            {/* TODO: confirm real delivery radius, timeframe, and fees before launch */}
            We currently offer local delivery within Yerevan. Choose &quot;Local delivery&quot;
            at checkout and our team will reach out to confirm delivery timing and any applicable
            delivery fee based on your address.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Shipping outside Yerevan</h2>
          <p className="mt-2">
            At this time we do not offer shipping outside the Yerevan area. If you&apos;re
            located elsewhere in Armenia and would like to arrange delivery, please{" "}
            <a href="/contact" className="underline">contact us</a> directly and we&apos;ll do our
            best to help.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Order processing time</h2>
          <p className="mt-2">
            {/* TODO: confirm real processing time */}
            Orders are typically prepared for pickup or delivery within 1–2 business days.
            You&apos;ll receive an email confirmation as soon as your order is placed.
          </p>
        </section>
      </div>
    </Container>
  );
}
