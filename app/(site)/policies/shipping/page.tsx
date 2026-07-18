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
          <h2 className="text-xl font-bold text-espresso">In-store pickup — free</h2>
          <p className="mt-2">
            Every online order can be picked up free of charge, ready the same day, at our
            store, <strong>50 Mashtots Avenue, Yerevan</strong>, during regular business hours
            (10:00 AM – 9:00 PM daily). Choose &quot;Pickup&quot; at checkout and we&apos;ll have
            your order ready — we&apos;ll contact you using the phone number or email provided
            once it&apos;s prepared.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Delivery within Yerevan — 500 AMD</h2>
          <p className="mt-2">
            Choose &quot;Delivery within Yerevan&quot; at checkout for delivery within 24 hours,
            for a flat 500 AMD fee.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Delivery outside Yerevan — from 1,000 AMD</h2>
          <p className="mt-2">
            We ship anywhere else in Armenia via Haypost courier, arriving in 3–5 days. The
            checkout price is 1,000 AMD; the final courier cost can vary with the weight of what
            you&apos;ve ordered, and we&apos;ll contact you first if it comes to more than that.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Gift wrapping</h2>
          <p className="mt-2">
            Add gift wrapping and an optional custom message to any order at checkout for 600
            AMD.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Order processing time</h2>
          <p className="mt-2">
            Orders are typically prepared for pickup or delivery within 1–2 business days.
            You&apos;ll receive an email confirmation as soon as your order is placed.
          </p>
        </section>
      </div>
    </Container>
  );
}
