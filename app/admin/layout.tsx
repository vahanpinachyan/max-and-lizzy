import type { Metadata } from "next";
import "../globals.css";

// The admin panel is intentionally its own root layout (own <html>/<body>,
// no storefront Header/Footer/cart/wishlist/welcome-popup) — a separate
// route group sibling to app/(site) rather than nesting under it, so
// shop-chrome components never mount on /admin pages. Auth + the sidebar
// shell live one level down, in admin/(protected)/layout.tsx, so the
// unauthenticated /admin/login page isn't caught in a redirect loop with
// itself.

export const metadata: Metadata = {
  title: { template: "%s | Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="fonts-admin h-full antialiased">
      <body className="min-h-full bg-beige">{children}</body>
    </html>
  );
}
