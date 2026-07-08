import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatAmd, formatDate } from "@/lib/format";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { orders: { include: { items: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!customer) notFound();

  const validOrders = customer.orders.filter((o) => o.status !== "cancelled");
  const totalSpentAmd = validOrders.reduce((sum, o) => sum + o.totalAmd, 0);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/customers" className="text-sm font-semibold text-terracotta-dark hover:underline">
        ← All customers
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-espresso">{customer.name || customer.email}</h1>
      <p className="text-sm text-espresso/60">{customer.email}{customer.phone ? ` · ${customer.phone}` : ""}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-tan/50 bg-white p-4">
          <p className="text-xs font-bold uppercase text-espresso/60">Orders</p>
          <p className="mt-1 text-xl font-bold text-espresso">{validOrders.length}</p>
        </div>
        <div className="rounded-2xl border border-tan/50 bg-white p-4">
          <p className="text-xs font-bold uppercase text-espresso/60">Total spent</p>
          <p className="mt-1 text-xl font-bold text-espresso">{formatAmd(totalSpentAmd)}</p>
        </div>
        <div className="rounded-2xl border border-tan/50 bg-white p-4">
          <p className="text-xs font-bold uppercase text-espresso/60">Customer since</p>
          <p className="mt-1 text-xl font-bold text-espresso">{formatDate(customer.createdAt.toISOString())}</p>
        </div>
      </div>

      <h2 className="mt-8 font-semibold text-espresso">Order history</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-tan/50 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-tan/50 bg-beige/50 text-xs font-bold uppercase text-espresso/70">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tan/30">
            {customer.orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-espresso/60">No orders yet.</td>
              </tr>
            )}
            {customer.orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-semibold text-terracotta-dark hover:underline">
                    {order.id.slice(-10)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-espresso/70">{order.items.reduce((n, i) => n + i.quantity, 0)}</td>
                <td className="px-4 py-3 font-semibold text-espresso">{formatAmd(order.totalAmd)}</td>
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
