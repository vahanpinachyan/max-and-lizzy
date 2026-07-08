import { requireManagerSession } from "@/lib/admin/permissions";
import { prisma } from "@/lib/db";
import { formatAmd } from "@/lib/format";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-tan/50 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-espresso/60">{label}</p>
      <p className="mt-1 text-2xl font-bold text-espresso">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-espresso/50">{sub}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireManagerSession();

  const [orders, customerCount, productCount] = await Promise.all([
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }),
    prisma.customer.count(),
    prisma.product.count(),
  ]);

  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.totalAmd, 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthOrders = activeOrders.filter((o) => o.createdAt >= startOfMonth);
  const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmd, 0);

  const statusCounts: Record<string, number> = {};
  for (const o of orders) statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;

  const itemTotals = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of activeOrders) {
    for (const item of o.items) {
      const key = item.productSlug ?? item.productName;
      const existing = itemTotals.get(key) ?? { name: item.productName, qty: 0, revenue: 0 };
      existing.qty += item.quantity;
      existing.revenue += item.priceAmd * item.quantity;
      itemTotals.set(key, existing);
    }
  }
  const bestsellers = Array.from(itemTotals.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const dayCounts = new Array(7).fill(0) as number[];
  for (const o of orders) dayCounts[o.createdAt.getDay()]++;
  const maxDayCount = Math.max(...dayCounts, 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-espresso">Dashboard</h1>
      <p className="mt-1 text-sm text-espresso/60">An overview of sales, stock, and store activity.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total revenue" value={formatAmd(totalRevenue)} sub={`${activeOrders.length} orders (excl. cancelled)`} />
        <StatCard label="This month" value={formatAmd(monthRevenue)} sub={`${monthOrders.length} orders`} />
        <StatCard label="Customers" value={String(customerCount)} />
        <StatCard label="Products" value={String(productCount)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-tan/50 bg-white p-5">
          <h2 className="font-semibold text-espresso">Best-selling products</h2>
          {bestsellers.length === 0 ? (
            <p className="mt-3 text-sm text-espresso/60">No sales yet.</p>
          ) : (
            <ol className="mt-3 space-y-2.5">
              {bestsellers.map((item, i) => (
                <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-espresso">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-beige text-xs font-bold text-espresso/70">
                      {i + 1}
                    </span>
                    {item.name}
                  </span>
                  <span className="shrink-0 text-espresso/60">
                    {item.qty} sold · {formatAmd(item.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-tan/50 bg-white p-5">
          <h2 className="font-semibold text-espresso">Busiest days</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-espresso/60">No orders yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {dayCounts.map((count, i) => (
                <div key={DAY_LABELS[i]} className="flex items-center gap-3 text-sm">
                  <span className="w-8 shrink-0 text-espresso/60">{DAY_LABELS[i]}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-beige">
                    <div
                      className="h-full rounded-full bg-wood"
                      style={{ width: `${(count / maxDayCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-espresso/60">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-tan/50 bg-white p-5">
        <h2 className="font-semibold text-espresso">Orders by status</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-espresso/60">No orders yet.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <span key={status} className="rounded-full bg-beige px-3 py-1.5 text-sm font-semibold text-espresso">
                {status.replace(/_/g, " ")}: {count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
