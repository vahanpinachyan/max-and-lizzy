import type { Metadata } from "next";
import { blogPosts } from "@/data/blog-posts";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { BlogCard } from "@/components/blog/BlogCard";
import { getServerDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = buildMetadata({
  title: "Blog & Guides",
  description:
    "Gift guides, age-appropriate toy advice, and educational play tips from the Max & Lizzy team.",
  pathname: "/blog",
});

export default async function BlogIndexPage() {
  const { dict: t } = await getServerDictionary();
  const sorted = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Container className="py-12">
      <h1 className="text-4xl font-bold text-espresso sm:text-5xl">{t.nav.blog}</h1>
      <p className="mt-3 max-w-2xl text-espresso/70">
        {t.blogPage.subtitle}
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </Container>
  );
}
