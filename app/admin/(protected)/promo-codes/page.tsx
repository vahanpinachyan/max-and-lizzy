import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { toggleActive, deletePromoCode } from "./actions";
import { requireManagerSession } from "@/lib/admin/permissions";

function isExpired(expiresAt: Date | null): boolean {
  return expiresAt ? expiresAt.getTime() < Date.now() : false;
}

export default async function AdminPromoCodesPage() {
  await requireManagerSession();
  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-espresso">Promo Codes</h1>
      <p className="mt-1 text-sm text-espresso/60">
        Codes created here work immediately at checkout and in the cart page — no deploy needed.
      </p>

      <div className="mt-6">
        <PromoCodeForm />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-tan/50 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-tan/50 bg-beige/50 text-xs font-bold uppercase text-espresso/70">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">% Off</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tan/30">
            {codes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-espresso/60">
                  No promo codes yet — create one above.
                </td>
              </tr>
            )}
            {codes.map((c) => {
              const expired = isExpired(c.expiresAt);
              const boundToggle = toggleActive.bind(null, c.id, !c.active);
              const boundDelete = deletePromoCode.bind(null, c.id);
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono font-semibold text-espresso">{c.code}</td>
                  <td className="px-4 py-3 text-espresso/70">{c.percentOff}%</td>
                  <td className="px-4 py-3 text-espresso/70">{c.description}</td>
                  <td className="px-4 py-3 text-espresso/70">
                    {c.expiresAt ? formatDate(c.expiresAt.toISOString()) : "—"}
                    {expired && <span className="ml-1.5 text-xs text-terracotta-dark">(expired)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <form action={boundToggle}>
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          c.active && !expired ? "bg-sage/15 text-sage-dark" : "bg-espresso/10 text-espresso/60"
                        }`}
                      >
                        {c.active ? "Active" : "Disabled"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <DeleteButton
                      action={boundDelete}
                      label="Delete"
                      confirmMessage={`Delete promo code "${c.code}"? This can't be undone.`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
