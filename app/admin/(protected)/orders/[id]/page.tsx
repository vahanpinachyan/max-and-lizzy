import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatAmd, formatDate, formatShippingAddress } from "@/lib/format";
import { localizeFulfillmentOptions } from "@/lib/i18n/localize-data";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { SendOrderEmailButton } from "@/components/admin/SendOrderEmailButton";
import { getAdminLocale, getAdminDictionary } from "@/lib/admin/i18n";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order) notFound();

  const locale = await getAdminLocale();
  const t = getAdminDictionary(locale);
  const statusSelectDict = { ...t.orderDetail, statusLabels: t.orderStatus };

  const address = formatShippingAddress(order.shippingAddress, locale);
  const fulfillment = localizeFulfillmentOptions(locale).find((o) => o.id === order.fulfillmentMethod);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm font-semibold text-terracotta-dark hover:underline">
        {t.orderDetail.allOrders}
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-espresso">{t.orderDetail.orderLabel} {order.id.slice(-10)}</h1>
          <p className="text-sm text-espresso/60">{t.orderDetail.placed} {formatDate(order.createdAt.toISOString())}</p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} dict={statusSelectDict} />
      </div>

      <div className="mt-4">
        <SendOrderEmailButton orderId={order.id} dict={t.orderDetail} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-tan/50 bg-white p-5">
          <h2 className="font-semibold text-espresso">{t.orderDetail.customer}</h2>
          <p className="mt-2 text-sm text-espresso">{order.customerName || order.customer.name || "-"}</p>
          <p className="text-sm text-espresso/70">{order.customer.email}</p>
          {order.customerPhone && <p className="text-sm text-espresso/70">{order.customerPhone}</p>}
          <Link href={`/admin/customers/${order.customer.id}`} className="mt-2 inline-block text-sm font-semibold text-terracotta-dark hover:underline">
            {t.orderDetail.viewCustomerHistory}
          </Link>
        </div>

        <div className="rounded-2xl border border-tan/50 bg-white p-5">
          <h2 className="font-semibold text-espresso">{t.orderDetail.fulfillment}</h2>
          <p className="mt-2 text-sm text-espresso">{fulfillment?.label ?? t.orderDetail.notSpecified}</p>
          {address && <p className="mt-1 text-sm text-espresso/70">{t.orderDetail.deliverTo}: {address}</p>}
          {order.promoCode && (
            <p className="mt-2 text-sm text-sage-dark">{t.orderDetail.promoCodeUsed}: {order.promoCode}</p>
          )}
          {order.giftWrap && (
            <div className="mt-3 rounded-xl bg-terracotta/10 px-3 py-2">
              <p className="text-sm font-semibold text-terracotta-dark">{t.orderDetail.giftWrapRequested}</p>
              {order.giftMessage && (
                <p className="mt-1 text-sm text-espresso/80">&ldquo;{order.giftMessage}&rdquo;</p>
              )}
            </div>
          )}
        </div>

        {order.notes && (
          <div className="rounded-2xl border border-tan/50 bg-white p-5 sm:col-span-2">
            <h2 className="font-semibold text-espresso">{t.orderDetail.customerNote}</h2>
            <p className="mt-2 text-sm text-espresso/80">&ldquo;{order.notes}&rdquo;</p>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-tan/50 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-tan/50 bg-beige/50 text-xs font-bold uppercase text-espresso/70">
            <tr>
              <th className="px-4 py-3">{t.orderDetail.item}</th>
              <th className="px-4 py-3">{t.orderDetail.sku}</th>
              <th className="px-4 py-3">{t.orderDetail.qty}</th>
              <th className="px-4 py-3">{t.orderDetail.price}</th>
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
              <td colSpan={2} className="px-4 py-3 text-right font-semibold text-espresso">{t.orderDetail.total}</td>
              <td className="px-4 py-3 font-bold text-espresso">{formatAmd(order.totalAmd)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
