import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatAmd, formatDate } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { SendOrderEmailButton } from "@/components/admin/SendOrderEmailButton";
import { ARMENIA_REGIONS } from "@/data/armenia-regions";

interface StoredDeliveryAddress {
  region?: string;
  city?: string;
  street?: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order) notFound();

  const address: StoredDeliveryAddress | null = order.shippingAddress
    ? JSON.parse(order.shippingAddress)
    : null;
  const regionLabel = address?.region ? ARMENIA_REGIONS.find((r) => r.id === address.region)?.label : undefined;
  const addressParts = address
    ? [
        regionLabel,
        address.city,
        address.street,
        address.apartment && `Apt. ${address.apartment}`,
        address.entrance && `Entrance ${address.entrance}`,
        address.floor && `Floor ${address.floor}`,
      ].filter(Boolean)
    : [];

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm font-semibold text-terracotta-dark hover:underline">
        ← All orders
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-espresso">Order {order.id.slice(-10)}</h1>
          <p className="text-sm text-espresso/60">Placed {formatDate(order.createdAt.toISOString())}</p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="mt-4">
        <SendOrderEmailButton orderId={order.id} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-tan/50 bg-white p-5">
          <h2 className="font-semibold text-espresso">Customer</h2>
          <p className="mt-2 text-sm text-espresso">{order.customerName || order.customer.name || "—"}</p>
          <p className="text-sm text-espresso/70">{order.customer.email}</p>
          {order.customerPhone && <p className="text-sm text-espresso/70">{order.customerPhone}</p>}
          <Link href={`/admin/customers/${order.customer.id}`} className="mt-2 inline-block text-sm font-semibold text-terracotta-dark hover:underline">
            View customer history →
          </Link>
        </div>

        <div className="rounded-2xl border border-tan/50 bg-white p-5">
          <h2 className="font-semibold text-espresso">Fulfillment</h2>
          <p className="mt-2 text-sm text-espresso">
            {order.fulfillmentMethod === "pickup"
              ? "Pickup in-store"
              : order.fulfillmentMethod === "delivery_yerevan"
                ? "Delivery — Yerevan"
                : order.fulfillmentMethod === "delivery_outside"
                  ? "Delivery — outside Yerevan (Haypost)"
                  : "Not specified"}
          </p>
          {addressParts.length > 0 && (
            <p className="mt-1 text-sm text-espresso/70">{addressParts.join(", ")}</p>
          )}
          {order.promoCode && (
            <p className="mt-2 text-sm text-sage-dark">Promo code used: {order.promoCode}</p>
          )}
          {order.giftWrap && (
            <div className="mt-3 rounded-xl bg-terracotta/10 px-3 py-2">
              <p className="text-sm font-semibold text-terracotta-dark">🎁 Gift wrapping requested</p>
              {order.giftMessage && (
                <p className="mt-1 text-sm text-espresso/80">&ldquo;{order.giftMessage}&rdquo;</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-tan/50 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-tan/50 bg-beige/50 text-xs font-bold uppercase text-espresso/70">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tan/30">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  {item.productSlug ? (
                    <Link href={`/product/${item.productSlug}`} target="_blank" className="font-semibold text-espresso hover:text-terracotta-dark">
                      {item.productName}
                    </Link>
                  ) : (
                    <span className="font-semibold text-espresso">{item.productName}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-espresso/70">{item.quantity}</td>
                <td className="px-4 py-3 text-espresso/70">{formatAmd(item.priceAmd)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-tan/50">
            <tr>
              <td colSpan={2} className="px-4 py-3 text-right font-semibold text-espresso">Total</td>
              <td className="px-4 py-3 font-bold text-espresso">{formatAmd(order.totalAmd)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
