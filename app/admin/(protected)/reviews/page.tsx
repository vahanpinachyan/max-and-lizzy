import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { StarRating } from "@/components/ui/StarRating";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { approveReview, unapproveReview, deleteReview } from "./actions";
import { requireManagerSession } from "@/lib/admin/permissions";

export default async function AdminReviewsPage() {
  await requireManagerSession();
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div>
      <h1 className="text-2xl font-bold text-espresso">Reviews</h1>
      <p className="mt-1 text-sm text-espresso/60">
        Reviews only appear on the storefront once approved. Every review here was submitted from a verified order.
      </p>

      <section className="mt-6">
        <h2 className="text-lg font-bold text-espresso">Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-espresso/60">Nothing waiting on approval.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {pending.map((r) => (
              <div key={r.id} className="rounded-2xl border border-tan/50 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">{r.productSlug}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating rating={r.rating} size={14} />
                      <p className="font-semibold text-espresso">{r.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-espresso/80">{r.body}</p>
                    <p className="mt-2 text-xs text-espresso/60">
                      {r.authorName} · {formatDate(r.createdAt.toISOString())}
                      {r.orderId && <span className="ml-1 text-sage-dark">· Verified purchase</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <form action={approveReview.bind(null, r.id)}>
                      <button type="submit" className="rounded-full bg-sage-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-sage-dark/90">
                        Approve
                      </button>
                    </form>
                    <DeleteButton action={deleteReview.bind(null, r.id)} label="Delete" confirmMessage={`Delete this review by ${r.authorName}? This can't be undone.`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-espresso">Approved ({approved.length})</h2>
        {approved.length === 0 ? (
          <p className="mt-2 text-sm text-espresso/60">No approved reviews yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-tan/50 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-tan/50 bg-beige/50 text-xs font-bold uppercase text-espresso/70">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tan/30">
                {approved.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-mono text-xs text-espresso/70">{r.productSlug}</td>
                    <td className="px-4 py-3"><StarRating rating={r.rating} size={13} /></td>
                    <td className="px-4 py-3 text-espresso">{r.title}</td>
                    <td className="px-4 py-3 text-espresso/70">{r.authorName}</td>
                    <td className="px-4 py-3 text-espresso/70">{formatDate(r.createdAt.toISOString())}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <form action={unapproveReview.bind(null, r.id)}>
                          <button type="submit" className="text-xs font-semibold text-espresso/60 hover:text-terracotta-dark">
                            Unpublish
                          </button>
                        </form>
                        <DeleteButton action={deleteReview.bind(null, r.id)} label="Delete" confirmMessage={`Delete this review by ${r.authorName}? This can't be undone.`} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
