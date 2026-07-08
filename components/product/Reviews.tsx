import type { ProductReview } from "@/types";
import { formatDate } from "@/lib/format";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { getServerDictionary } from "@/lib/i18n/server";
import { interpolate } from "@/lib/i18n/interpolate";

export async function Reviews({
  reviews,
  averageRating,
}: {
  reviews: ProductReview[];
  averageRating: number | null;
}) {
  const { dict: t, locale } = await getServerDictionary();
  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-espresso">{t.product.reviewsTitle}</h2>
        {averageRating && (
          <StarRating rating={averageRating} showValue ariaLabel={interpolate(t.product.ratedAria, { rating: averageRating })} />
        )}
        <span className="text-sm text-espresso/70">({reviews.length})</span>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 text-espresso/70">
          {t.product.noReviews}
        </p>
      ) : (
        <ul className="mt-6 space-y-6">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-tan/40 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <StarRating rating={review.rating} size={16} ariaLabel={interpolate(t.product.ratedAria, { rating: review.rating })} />
                {review.verifiedPurchase && <Badge variant="sage">{t.product.verifiedPurchase}</Badge>}
              </div>
              <h3 className="mt-2 font-semibold text-espresso">{review.title}</h3>
              <p className="mt-1 text-sm text-espresso/80">{review.body}</p>
              <p className="mt-2 text-xs text-espresso/70">
                {review.author} · {formatDate(review.date, locale)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
