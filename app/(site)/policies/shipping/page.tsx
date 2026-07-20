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
      <p className="mt-2 text-sm text-espresso/70">Last updated: July 18, 2026</p>

      <div className="prose-content mt-8 space-y-6 text-espresso/80">
        <section>
          <h2 className="text-xl font-bold text-espresso">Free in-store pickup</h2>
          <p className="mt-2">
            Every online order can be picked up free of charge at our store,{" "}
            <strong>50 Mashtots Avenue, Yerevan</strong>, during regular business hours
            (10:00 AM to 9:00 PM daily). Orders are typically ready the same day. Choose
            &quot;Pickup&quot; at checkout, and we will contact you by phone or email once your
            order is ready for collection.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Delivery within Yerevan (500 AMD)</h2>
          <p className="mt-2">
            Choose &quot;Delivery within Yerevan&quot; at checkout for delivery within 24 hours.
            This service costs a flat 500 AMD.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Delivery outside Yerevan (from 1,000 AMD)</h2>
          <p className="mt-2">
            We ship to the rest of Armenia through Haypost courier service, with delivery
            typically taking 3–5 days. The checkout price starts at 1,000 AMD. The final courier
            cost depends on the weight of your order; if it exceeds the amount charged at
            checkout, we will contact you before proceeding.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Gift wrapping</h2>
          <p className="mt-2">
            Gift wrapping is available for 600 AMD, with an optional custom message. You can add
            this to any order at checkout.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Order processing time</h2>
          <p className="mt-2">
            Orders are generally prepared for pickup or delivery within 1–2 business days. You
            will receive an email confirmation as soon as your order is placed.
          </p>
        </section>
      </div>
    </Container>
  );
}
