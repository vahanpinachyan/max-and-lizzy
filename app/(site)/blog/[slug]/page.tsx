import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/data/blog-posts";
import { buildMetadata, blogPostJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogCard } from "@/components/blog/BlogCard";
import { getServerDictionary } from "@/lib/i18n/server";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.metaDescription,
    pathname: `/blog/${post.slug}`,
    image: post.coverImage,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const { dict: t, locale } = await getServerDictionary();
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article>
      <JsonLd data={blogPostJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.blog, path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <Container className="max-w-3xl py-12">
        <nav aria-label={t.breadcrumb.ariaLabel} className="mb-6 text-sm text-espresso/70">
          <ol className="flex gap-2">
            <li><Link href="/blog" className="hover:text-terracotta-dark">{t.nav.blog}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-espresso">{post.title}</li>
          </ol>
        </nav>

        <p className="text-sm font-semibold uppercase tracking-wide text-sage-dark">
          {post.tags.join(" · ")}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-espresso sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-espresso/70">
          {post.author} · {formatDate(post.date, locale)}
        </p>

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={post.coverImage} alt={post.coverImageAlt} fill priority className="object-cover" sizes="(min-width: 768px) 768px, 100vw" />
        </div>

        <div className="mt-8">
          <BlogContent content={post.content} />
        </div>
      </Container>

      {related.length > 0 && (
        <Container className="max-w-5xl pb-16">
          <h2 className="text-2xl font-bold text-espresso">{t.blogPage.moreGuides}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </Container>
      )}
    </article>
  );
}
