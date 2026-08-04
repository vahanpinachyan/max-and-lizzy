import type { NextConfig } from "next";

// Every directive here is scoped to something this site actually does —
// loosening any of these needs a matching reason, not just "CSP broke it":
//   - script-src needs 'unsafe-inline' because Next's own hydration bootstrap,
//     the GA4/Omnisend inline init snippets, and JSON-LD <script> tags
//     (components/seo/JsonLd.tsx) are all inline; there's no nonce plumbing.
//     'unsafe-eval' is dev-only, for React Fast Refresh's eval-based sourcemaps.
//   - form-action must allow banking.idram.am — the cart page submits a real
//     cross-origin <form> there to start an Idram payment (see
//     submitIdramForm in app/(site)/cart/page.tsx). Without this the entire
//     Idram checkout path breaks.
//   - frame-src allows Google Maps — the Visit Us page embeds the store
//     location as an <iframe>.
//   - img-src allows any https origin because the Instagram feed
//     (components/home/InstagramFeed.tsx) renders images straight from
//     Instagram's CDN, which uses many rotating scontent-* subdomains that
//     can't be pinned to a fixed allowlist.
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://omnisnippet1.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.omnisend.com https://omnisnippet1.com",
  "frame-src https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://banking.idram.am",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: cspDirectives },
        ],
      },
    ];
  },
  images: {
    // Placeholder SVGs (scripts/generate-placeholder-images.mjs) are local
    // and trusted, so SVG optimization is safe to allow.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Product photos use quality={90}/{95} for sharper rendering than the
    // Next.js default (75) allows, so those values must be explicitly permitted.
    qualities: [75, 90, 95],
    // Photos uploaded via the admin panel's "+ Add photos" button (see
    // app/api/admin/upload) are stored in Vercel Blob and referenced by
    // their public URL — next/image needs the host allow-listed to render
    // (and optimize) them on the storefront.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // OrderItem.imageUrl (see prisma/schema.prisma) is snapshotted via
      // absoluteUrl() at order time, so it's always a fully-qualified URL
      // even though it points back at our own product photos.
      { protocol: "https", hostname: "maxandlizzy.com" },
    ],
  },
};

export default nextConfig;
