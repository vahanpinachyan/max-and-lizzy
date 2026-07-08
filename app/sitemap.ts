import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getAllProductSlugs } from "@/data/products";
import { categories } from "@/data/categories";
import { blogPosts } from "@/data/blog-posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productSlugs = await getAllProductSlugs();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/visit-us`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site.url}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${site.url}/cart`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/policies/shipping`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/policies/returns`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/policies/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${site.url}/shop/${cat.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${site.url}/product/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${site.url}/blog/${p.slug}`,
    lastModified: p.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages];
}
