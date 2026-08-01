import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
