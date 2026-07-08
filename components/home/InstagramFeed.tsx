import Image from "next/image";
import { instagramPosts } from "@/data/instagram-posts";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionDecorations } from "@/components/ui/Decorations";
import { getServerDictionary } from "@/lib/i18n/server";

export async function InstagramFeed() {
  const { dict: t } = await getServerDictionary();
  return (
    <section className="relative overflow-hidden bg-beige/60 py-16">
      <SectionDecorations variant="clouds" />
      <Container className="relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow={t.home.instagramEyebrow}
            title={t.home.instagramTitle}
            description={t.home.instagramDescription}
          />
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border-2 border-espresso px-5 py-2.5 text-sm font-semibold text-espresso transition-colors hover:bg-espresso hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" strokeWidth="2" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
            {t.home.followUs}
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {instagramPosts.map((post) => (
            <a
              key={post.slug}
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-2xl bg-white"
            >
              <Image
                src={post.image}
                alt={post.caption}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-4 bg-espresso/0 opacity-0 transition-all duration-300 group-hover:bg-espresso/50 group-hover:opacity-100">
                <span className="flex items-center gap-1 text-sm font-semibold text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1 4 2 0 0 1 0 2 0 .5-1 2-2 4-2 3.5 0 5.5 3.5 3.5 7.5C19 16.65 12 21 12 21z" />
                  </svg>
                  {post.likes}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4 4h16v12H8l-4 4V4z" />
                  </svg>
                  {post.comments}
                </span>
              </div>
              <span className="sr-only">{post.caption}</span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
