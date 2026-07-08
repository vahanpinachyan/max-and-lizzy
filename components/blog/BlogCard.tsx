"use client";

import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types";
import { formatDate } from "@/lib/format";
import { useTranslations, useI18n } from "@/lib/i18n/context";

export function BlogCard({ post }: { post: BlogPost }) {
  const t = useTranslations();
  const { locale } = useI18n();
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-tan/50 bg-white">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] bg-beige">
        <Image
          src={post.coverImage}
          alt={post.coverImageAlt}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, 100vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-sage-dark">
          {formatDate(post.date, locale)}
        </p>
        <Link href={`/blog/${post.slug}`}>
          <h2 className="mt-2 text-lg font-bold text-espresso hover:text-terracotta-dark">
            {post.title}
          </h2>
        </Link>
        <p className="mt-2 flex-1 text-sm text-espresso/70 line-clamp-3">{post.excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 text-sm font-semibold text-terracotta-dark hover:underline"
        >
          {t.blogPage.readMore}
        </Link>
      </div>
    </article>
  );
}
