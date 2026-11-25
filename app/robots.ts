import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/cart", "/checkout/idram", "/checkout/arca", "/preview/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
