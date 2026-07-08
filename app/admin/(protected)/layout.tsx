import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { logoutAction } from "@/app/admin/actions";
import { prisma } from "@/lib/db";
import { isLowStock } from "@/lib/inventory";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  let lowStockCount = 0;
  if (admin.role === "manager") {
    const products = await prisma.product.findMany({
      where: { inStock: true, stockQuantity: { not: null } },
      select: { inStock: true, stockQuantity: true },
    });
    lowStockCount = products.filter((p) => isLowStock(p)).length;
  }

  return (
    <div className="flex min-h-screen bg-beige">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-tan/50 bg-cream sm:flex">
        <div className="border-b border-tan/50 px-5 py-5">
          <p className="font-heading text-lg font-bold text-espresso">Max &amp; Lizzy</p>
          <p className="text-xs text-espresso/60">{admin.email}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {admin.role === "manager" && (
            <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
              Dashboard
            </Link>
          )}
          <Link href="/admin/orders" className="block rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
            Orders
          </Link>
          <Link href="/admin/customers" className="block rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
            Customers
          </Link>
          {admin.role === "manager" && (
            <>
              <Link href="/admin/products" className="block rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
                Products
              </Link>
              <Link href="/admin/promo-codes" className="block rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
                Promo Codes
              </Link>
              <Link href="/admin/staff" className="block rounded-lg px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige">
                Staff
              </Link>
            </>
          )}
        </nav>
        <div className="border-t border-tan/50 p-3">
          <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-espresso/70 hover:bg-beige">
            ← Back to store
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-terracotta-dark hover:bg-beige">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-tan/50 bg-cream px-4 py-3 sm:hidden">
          <p className="font-heading text-lg font-bold text-espresso">Max &amp; Lizzy Admin</p>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-terracotta-dark">Sign out</button>
          </form>
        </header>
        {lowStockCount > 0 && (
          <Link
            href="/admin/products?lowStock=1"
            className="flex items-center gap-2 border-b border-terracotta/30 bg-terracotta/10 px-4 py-2.5 text-sm font-semibold text-terracotta-dark hover:bg-terracotta/15 sm:px-8"
          >
            ⚠ {lowStockCount} product{lowStockCount === 1 ? "" : "s"} running low on stock — review inventory
          </Link>
        )}
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
