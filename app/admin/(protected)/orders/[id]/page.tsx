import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatAmd, formatDate, formatShippingAddress } from "@/lib/format";
import { getFulfillmentOption } from "@/data/fulfillment";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { SendOrderEmailButton } from "@/components/admin/SendOrderEmailButton";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order) notFound();

  const address = formatShippingAddress(order.shippingAddress);
  const fulfillment = getFulfillmentOption(order.fulfillmentMethod);

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
          <p className="mt-2 text-sm text-espresso">{order.customerName || order.customer.name || "-"}</p>
          <p className="text-sm text-espresso/70">{order.customer.email}</p>
          {order.customerPhone && <p className="text-sm text-espresso/70">{order.customerPhone}</p>}
          <Link href={`/admin/customers/${order.customer.id}`} className="mt-2 inline-block text-sm font-semibold text-terracotta-dark hover:underline">
            View customer history →
          </Link>
        </div>

        <div className="rounded-2xl border border-tan/50 bg-white p-5">
          <h2 className="font-semibold text-espresso">Fulfillment</h2>
          <p className="mt-2 text-sm text-espresso">{fulfillment?.label ?? "Not specified"}</p>
          {address && <p className="mt-1 text-sm text-espresso/70">Deliver to: {address}</p>}
          {order.promoCode && (
            <p className="mt-2 text-sm text-sage-dark">Promo code used: {order.promoCode}</p>
          )}
          {order.giftWrap && (
            <div className="mt-3 rounded-xl bg-terracotta/10 px-3 py-2">
              <p className="text-sm font-semibold text-terracotta-dark">Gift wrapping requested</p>
              {order.giftMessage && (
                <p className="mt-1 text-sm text-espresso/80">&ldquo;{order.giftMessage}&rdquo;</p>
              )}
            </div>
          )}
        </div>

        {order.notes && (
          <div className="rounded-2xl border border-tan/50 bg-white p-5 sm:col-span-2">
            <h2 className="font-semibold text-espresso">Customer note</h2>
            <p className="mt-2 text-sm text-espresso/80">&ldquo;{order.notes}&rdquo;</p>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-tan/50 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-tan/50 bg-beige/50 text-xs font-bold uppercase text-espresso/70">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tan/30">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-beige">
                      {item.imageUrl && (
                        <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="48px" />
                      )}
                    </div>
                    {item.productSlug ? (
                      <Link href={`/product/${item.productSlug}`} target="_blank" className="font-semibold text-espresso hover:text-terracotta-dark">
                        {item.productName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-espresso">{item.productName}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-espresso/70">{item.sku || "-"}</td>
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
