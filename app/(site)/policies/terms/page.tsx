import type { Metadata } from "next";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "Terms and conditions for buying from Max & Lizzy online or in-store.",
  pathname: "/policies/terms",
});

export default function TermsPolicyPage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-4xl font-bold text-espresso">Terms &amp; Conditions</h1>
      <p className="mt-2 text-sm text-espresso/70">Last updated: placeholder — update before launch</p>

      <div className="mt-8 space-y-6 text-espresso/80">
        <section>
          <h2 className="text-xl font-bold text-espresso">Who you&apos;re buying from</h2>
          <p className="mt-2">
            {/* TODO: confirm registration number and tax ID before launch */}
            {site.name} is operated by <strong>{site.legalName}</strong> ({site.legalNameHy}), a
            company registered in the Republic of Armenia, trading as &quot;{site.name}&quot;
            from our store at {site.address.street}, {site.address.city}, {site.address.country}.
            By placing an order with us, whether online or in-store, you&apos;re entering into a
            contract with {site.legalName}, not with a separate &quot;Max &amp; Lizzy&quot; entity.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Products &amp; pricing</h2>
          <p className="mt-2">
            All prices on the site are listed in Armenian dram (AMD) and include any applicable
            taxes unless stated otherwise. We work to keep product photos, descriptions, and
            stock levels accurate, but occasionally a listing may contain an error — if we catch a
            pricing or availability mistake after you&apos;ve ordered, we&apos;ll contact you
            before charging or fulfilling anything.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Orders &amp; payment</h2>
          <p className="mt-2">
            Placing an order is an offer to buy, which we accept once payment is confirmed.
            Online payments are processed securely through Stripe — we never see or store your
            full card details. An order is only confirmed once you receive an order confirmation
            email.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Delivery &amp; pickup</h2>
          <p className="mt-2">
            See our <a href="/policies/shipping" className="underline">Shipping &amp; Delivery
            Policy</a> for pickup and local delivery details.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Returns &amp; cancellations</h2>
          <p className="mt-2">
            See our <a href="/policies/returns" className="underline">Returns &amp; Exchanges
            policy</a> for how to return or exchange an item, and what isn&apos;t eligible.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Product safety &amp; warranty</h2>
          <p className="mt-2">
            {/* TODO: confirm warranty terms once supplier warranty details are finalized */}
            We only sell toys tested to recognized safety standards for their stated age range.
            If a toy arrives faulty, see the Returns &amp; Exchanges policy above — most items also
            carry a manufacturer warranty against defects, noted on the product page where it
            applies.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Limitation of liability</h2>
          <p className="mt-2">
            To the extent permitted by Armenian law, {site.legalName} is not liable for indirect
            or consequential losses arising from your use of the site or our products, beyond the
            price you paid for the item in question. Nothing in these terms limits any right you
            have under Armenian consumer protection law that can&apos;t lawfully be excluded.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Intellectual property</h2>
          <p className="mt-2">
            The {site.name} name, logo, and site content (text, photos, illustrations) belong to{" "}
            {site.legalName} or its licensors and may not be reused without permission. Product
            photos and trademarks belonging to the brands we sell remain the property of their
            respective owners.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Governing law</h2>
          <p className="mt-2">
            These terms are governed by the laws of the Republic of Armenia, and any dispute that
            can&apos;t be resolved directly with us is subject to the jurisdiction of the courts of
            Armenia.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Changes to these terms</h2>
          <p className="mt-2">
            We may update these terms from time to time — the &quot;Last updated&quot; date at the
            top of this page reflects the latest version. Continuing to use the site or place
            orders after a change means you accept the updated terms.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Contact</h2>
          <p className="mt-2">
            Questions about these terms? Reach us via our{" "}
            <a href="/contact" className="underline">contact page</a>, by phone at{" "}
            <a href={site.phoneHref} className="underline">{site.phone}</a>, or by email at{" "}
            <a href={`mailto:${site.email}`} className="underline">{site.email}</a>.
          </p>
        </section>
      </div>
    </Container>
  );
}
