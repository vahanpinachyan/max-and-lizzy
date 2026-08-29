import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { logoutAction } from "@/app/admin/actions";
import { prisma } from "@/lib/db";
import { isLowStock } from "@/lib/inventory";
import { NewOrderWatcher } from "@/components/admin/NewOrderWatcher";
import { AdminLocaleSwitcher } from "@/components/admin/AdminLocaleSwitcher";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { getAdminLocale, getAdminDictionary } from "@/lib/admin/i18n";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  const locale = await getAdminLocale();
  const t = getAdminDictionary(locale);

  let lowStockCount = 0;
  let pendingReviewCount = 0;
  if (admin.role === "manager") {
    const products = await prisma.product.findMany({
      where: { inStock: true, stockQuantity: { not: null } },
      select: { inStock: true, stockQuantity: true },
    });
    lowStockCount = products.filter((p) => isLowStock(p)).length;
    pendingReviewCount = await prisma.review.count({ where: { approved: false } });
  }

  // Both roles handle orders (cashiers included), so this isn't gated to
  // manager-only like the counts above.
  const latestOrder = await prisma.order.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } });

  // Shared between the desktop sidebar <nav> and the mobile drawer below —
  // built once here since both need the same role-gated links.
  const navLinks = (
    <>
      {admin.role === "manager" && (
        <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
          {t.nav.dashboard}
        </Link>
      )}
      <Link href="/admin/orders" className="block rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
        {t.nav.orders}
      </Link>
      <Link href="/admin/customers" className="block rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
        {t.nav.customers}
      </Link>
      {admin.role === "manager" && (
        <>
          <Link href="/admin/products" className="block rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
            {t.nav.products}
          </Link>
          <Link href="/admin/promo-codes" className="block rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
            {t.nav.promoCodes}
          </Link>
          <Link href="/admin/reviews" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
            <span>{t.nav.reviews}</span>
            {pendingReviewCount > 0 && (
              <span className="rounded-full bg-terracotta px-2 py-0.5 text-xs font-bold text-white">
                {pendingReviewCount}
              </span>
            )}
          </Link>
          <Link href="/admin/staff" className="block rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
            {t.nav.staff}
          </Link>
        </>
      )}
    </>
  );

  const footerLinks = (
    <>
      <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-espresso/70 hover:bg-beige">
        {t.nav.backToStore}
      </Link>
      <form action={logoutAction}>
        <button type="submit" className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-terracotta-dark hover:bg-beige">
          {t.nav.signOut}
        </button>
      </form>
    </>
  );

  return (
    <div className="flex min-h-screen bg-beige">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-tan/50 bg-cream sm:flex">
        <div className="border-b border-tan/50 px-5 py-5">
          <p className="font-heading text-lg font-bold text-espresso">Max &amp; Lizzy</p>
          <p className="text-xs text-espresso/60">{admin.email}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">{navLinks}</nav>
        {/* Language switcher sits above the line above "back to store", not
            up in the header box, so it reads as part of this bottom
            account-actions group rather than floating next to the email. */}
        <div className="flex justify-center border-t border-tan/50 py-3">
          <AdminLocaleSwitcher locale={locale} />
        </div>
        <div className="border-t border-tan/50 p-3">{footerLinks}</div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center gap-2 border-b border-tan/50 bg-cream px-4 py-3 sm:hidden">
          <AdminMobileNav>
            <div className="space-y-1">{navLinks}</div>
            <div className="mt-3 flex justify-center border-t border-tan/50 pt-3">
              <AdminLocaleSwitcher locale={locale} />
            </div>
            <div className="mt-3 border-t border-tan/50 pt-3">{footerLinks}</div>
          </AdminMobileNav>
          <p className="font-heading text-lg font-bold text-espresso">Max &amp; Lizzy Admin</p>
        </header>
        {lowStockCount > 0 && (
          <Link
            href="/admin/products?lowStock=1"
            className="flex items-center gap-2 border-b border-terracotta/30 bg-terracotta/10 px-4 py-2.5 text-sm font-semibold text-terracotta-dark hover:bg-terracotta/15 sm:px-8"
          >
            {t.lowStockBanner(lowStockCount)}
          </Link>
        )}
        <main className="p-4 sm:p-8">{children}</main>
      </div>
      <NewOrderWatcher latestOrderCreatedAt={latestOrder?.createdAt.toISOString() ?? null} />
    </div>
  );
}
