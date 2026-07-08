import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionDecorations } from "@/components/ui/Decorations";
import { getServerDictionary } from "@/lib/i18n/server";

const ICONS = [
  <path
    key="eco"
    d="M12 3C7 3 4 7 4 11c0 5 4 8 8 10 4-2 8-5 8-10 0-4-3-8-8-8z"
    strokeWidth="2"
    strokeLinejoin="round"
  />,
  <path
    key="safety"
    d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z"
    strokeWidth="2"
    strokeLinejoin="round"
  />,
  <path
    key="edu"
    d="M12 4l9 5-9 5-9-5 9-5zm-9 5v6l9 5 9-5V9"
    strokeWidth="2"
    strokeLinejoin="round"
    strokeLinecap="round"
  />,
  <path
    key="local"
    d="M4 21V9l8-6 8 6v12h-5v-6H9v6H4z"
    strokeWidth="2"
    strokeLinejoin="round"
  />,
];

export async function WhyUs() {
  const { dict: t } = await getServerDictionary();
  return (
    <section className="relative overflow-hidden bg-sage/10 py-16">
      <SectionDecorations variant="clouds" />
      <Container className="relative">
        <SectionHeading
          align="center"
          eyebrow={t.home.whyUsEyebrow}
          title={t.home.whyUsTitle}
        />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.whyUsPoints.map((point, i) => (
            <div key={point.title} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-sage-dark shadow-sm">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  {ICONS[i]}
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-espresso">{point.title}</h3>
              <p className="mt-2 text-sm text-espresso/70">{point.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
