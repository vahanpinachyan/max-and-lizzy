import type { Metadata } from "next";
import { site } from "@/data/site";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Max & Lizzy collects, uses, and protects your personal information.",
  pathname: "/policies/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-4xl font-bold text-espresso">Privacy Policy</h1>
      <p className="mt-2 text-sm text-espresso/70">Last updated: placeholder — update before launch</p>

      <div className="mt-8 space-y-6 text-espresso/80">
        <section>
          <h2 className="text-xl font-bold text-espresso">Information we collect</h2>
          <p className="mt-2">
            {/* TODO: legal review recommended before launch */}
            When you shop with us online, we collect the information necessary to process your
            order: your name, email address, phone number, delivery address (if applicable), and
            payment details. Payment information is collected and processed directly by Stripe,
            our payment processor — we never see or store your full card number.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">How we use your information</h2>
          <p className="mt-2">
            We use your information to fulfill and communicate about your order, respond to
            inquiries submitted through our contact form, and, if you opt in, send occasional
            newsletter emails with gift guides and play tips. We do not sell your personal
            information to third parties.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Cookies &amp; analytics</h2>
          <p className="mt-2">
            Our site may use cookies and analytics tools (such as Google Analytics) to understand
            how visitors use the site and improve the shopping experience.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Third-party services</h2>
          <p className="mt-2">
            We share order information with Stripe (payment processing) and, where applicable,
            our email service provider (order and newsletter emails) solely to provide our
            services to you.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Your rights</h2>
          <p className="mt-2">
            You may request access to, correction of, or deletion of your personal information at
            any time by contacting us at{" "}
            <a href={`mailto:${site.email}`} className="underline">{site.email}</a>.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-espresso">Contact</h2>
          <p className="mt-2">
            Questions about this policy? Reach us via our <a href="/contact" className="underline">contact page</a> or
            visit us at {site.address.street}, {site.address.city}.
          </p>
        </section>
      </div>
    </Container>
  );
}
