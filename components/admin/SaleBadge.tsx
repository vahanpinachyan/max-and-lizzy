import type { AdminDictionary, AdminLocale } from "@/lib/admin/i18n";
import { formatShopDate, type AdminSaleBadge } from "@/lib/admin/sale-status";
import { interpolate } from "@/lib/i18n/interpolate";

function badgeText(sale: AdminSaleBadge, t: AdminDictionary["productsList"], locale: AdminLocale): string {
  if (sale.kind === "scheduled") {
    return interpolate(t.saleScheduledFrom, {
      percent: sale.percent,
      date: formatShopDate(sale.startsAt!, locale),
    });
  }
  if (sale.endsAt === null) return interpolate(t.saleActiveOpen, { percent: sale.percent });
  // endsAt is the exclusive boundary — midnight at the *start* of the day
  // after the sale. Staff set "to 13 Nov" and must read "until 13 Nov", so
  // step back inside the window before formatting.
  const lastDay = new Date(new Date(sale.endsAt).getTime() - 1).toISOString();
  return interpolate(t.saleActiveUntil, { percent: sale.percent, date: formatShopDate(lastDay, locale) });
}

export function SaleBadge({
  sale,
  t,
  locale,
}: {
  sale: AdminSaleBadge;
  t: AdminDictionary["productsList"];
  locale: AdminLocale;
}) {
  const active = sale.kind === "active";
  return (
    <p
      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        active ? "bg-terracotta/15 text-terracotta-dark" : "bg-wood/10 text-wood-dark"
      }`}
    >
      <span aria-hidden="true">{active ? "●" : "○"}</span>
      {badgeText(sale, t, locale)}
    </p>
  );
}
