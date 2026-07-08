import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatAmd, formatDate } from "@/lib/format";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    include: { orders: { where: { status: { not: "cancelled" } } } },
  });

  const ranked = customers
    .map((c) => ({
      ...c,
      orderCount: c.orders.length,
      totalSpentAmd: c.orders.reduce((sum, o) => sum + o.totalAmd, 0),
      lastOrderAt: c.orders.reduce<Date | null>((latest, o) => (!latest || o.createdAt > latest ? o.createdAt : latest), null),
    }))
    .sort((a, b) => b.totalSpentAmd - a.totalSpentAmd);

  return (
    <div>
      <h1 className="text-2xl font-bold text-espresso">Customers ({ranked.length})</h1>
      <p className="mt-1 text-sm text-espresso/60">Sorted by total spent — your best local buyers first.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-tan/50 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-tan/50 bg-beige/50 text-xs font-bold uppercase text-espresso/70">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total spent</th>
              <th className="px-4 py-3">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tan/30">
            {ranked.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-espresso/60">
                  No customers yet — they&apos;re created automatically from completed orders.
                </td>
              </tr>
            )}
            {ranked.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/customers/${c.id}`} className="font-semibold text-espresso hover:text-terracotta-dark">
                    {c.name || c.email}
                  </Link>
                  <p className="text-xs text-espresso/60">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-espresso/70">{c.orderCount}</td>
                <td className="px-4 py-3 font-semibold text-espresso">{formatAmd(c.totalSpentAmd)}</td>
                <td className="px-4 py-3 text-espresso/70">{c.lastOrderAt ? formatDate(c.lastOrderAt.toISOString()) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
