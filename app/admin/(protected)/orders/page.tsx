import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatAmd, formatDate } from "@/lib/format";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { ORDER_STATUSES } from "@/lib/orders";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const where = status && ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number]) ? { status } : {};

  const orders = await prisma.order.findMany({
    where,
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-espresso">Orders ({orders.length})</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${!status ? "bg-wood text-white" : "bg-white text-espresso border border-tan/50"}`}
        >
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${status === s ? "bg-wood text-white" : "bg-white text-espresso border border-tan/50"}`}
          >
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-tan/50 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-tan/50 bg-beige/50 text-xs font-bold uppercase text-espresso/70">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Fulfillment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tan/30">
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-espresso/60">
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-semibold text-terracotta-dark hover:underline">
                    {order.id.slice(-10)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-espresso">{order.customerName || order.customer.name || "—"}</p>
                  <p className="text-xs text-espresso/60">{order.customer.email}</p>
                </td>
                <td className="px-4 py-3 text-espresso/70">{order.items.reduce((n, i) => n + i.quantity, 0)}</td>
                <td className="px-4 py-3 font-semibold text-espresso">{formatAmd(order.totalAmd)}</td>
                <td className="px-4 py-3 text-espresso/70">{order.fulfillmentMethod ?? "—"}</td>
                <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                <td className="px-4 py-3 text-espresso/70">{formatDate(order.createdAt.toISOString())}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
