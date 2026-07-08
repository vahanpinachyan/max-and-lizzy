import type { Metadata } from "next";
import Image from "next/image";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "Learn the story behind Max & Lizzy, our mission to bring safe, educational, eco-friendly toys to families in Yerevan, and why we care about what kids play with.",
  pathname: "/about",
});

export default function AboutPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-sage-dark">Our Story</p>
        <h1 className="mt-2 text-4xl font-bold text-espresso sm:text-5xl">
          Toys chosen the way we&apos;d choose them for our own kids
        </h1>
        <p className="mt-5 text-lg text-espresso/75">
          {/* Placeholder copy — replace with your real founding story. */}
          Max &amp; Lizzy started with a simple frustration: too many toy aisles full of
          plastic, batteries, and packaging that ends up in the trash within a week. We wanted
          something different for our own children — toys made from real materials, built to
          survive being loved (and dropped, and chewed on, and passed down), and chosen because
          they actually help kids learn, not just because they&apos;re loud or trendy.
        </p>
      </div>

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="/images/about-story.svg"
            alt="Max & Lizzy founders selecting wooden toys for the shop"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-espresso">Why wooden, educational, and eco-friendly?</h2>
          <p className="mt-4 text-espresso/80">
            {/* Placeholder copy */}
            Every product on our shelves is chosen against three questions: Is it made from
            honest, sustainable materials? Does it hold up to real, everyday play? And does it
            actually build a skill — fine motor control, early language, spatial reasoning —
            rather than just occupying a few minutes of attention?
          </p>
          <p className="mt-4 text-espresso/80">
            We work directly with manufacturers who share that philosophy, and every toy we
            carry is safety-tested to ASTM F963 and EN71 standards before it reaches our shelves.
          </p>
        </div>
      </div>

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <h2 className="text-2xl font-bold text-espresso">Meet the founders</h2>
          <p className="mt-4 text-espresso/80">
            {/* Placeholder copy — replace with real founder bios/photo */}
            Max &amp; Lizzy is run by a small, hands-on team based right here in Yerevan. We&apos;re
            parents, former educators, and lifelong fans of a good wooden puzzle — and we&apos;re
            usually the ones behind the counter when you visit, happy to talk through what might
            suit your child best.
          </p>
        </div>
        <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-3xl lg:order-2">
          <Image
            src="/images/about-founders.svg"
            alt="Max & Lizzy founders in the store"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>

      <div className="mt-16 rounded-3xl bg-sage/10 p-10 text-center">
        <h2 className="text-2xl font-bold text-espresso">Come see us in person</h2>
        <p className="mt-3 text-espresso/75">
          The best way to find the right toy is to see and handle it. Stop by our store on
          Mashtots Avenue — our team is always happy to help you choose.
        </p>
        <LinkButton href="/visit-us" className="mt-6">
          Visit Us
        </LinkButton>
      </div>
    </Container>
  );
}
