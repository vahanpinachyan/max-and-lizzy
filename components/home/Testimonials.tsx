import { testimonials } from "@/data/testimonials";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StarRating } from "@/components/ui/StarRating";
import { SectionDecorations } from "@/components/ui/Decorations";
import { getServerDictionary } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/interpolate";

export async function Testimonials() {
  const { dict } = await getServerDictionary();
  return (
    <section className="relative overflow-hidden py-16">
      <SectionDecorations variant="flowers" />
      <Container className="relative">
        <SectionHeading align="center" eyebrow={dict.home.testimonialsEyebrow} title={dict.home.testimonialsTitle} />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((item) => (
            <figure key={item.id} className="flex flex-col rounded-3xl border border-tan/50 bg-white p-6">
              <StarRating rating={item.rating} size={16} ariaLabel={interpolate(dict.product.ratedAria, { rating: item.rating })} />
              <blockquote className="mt-3 flex-1 text-sm text-espresso/80">“{item.quote}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-espresso">
                {item.author}
                {item.location && <span className="font-normal text-espresso/70"> — {item.location}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
