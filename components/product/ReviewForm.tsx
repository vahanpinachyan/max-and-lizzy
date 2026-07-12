"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/lib/i18n/context";

export function ReviewForm({
  orderId,
  productSlug,
  productName,
}: {
  orderId: string;
  productSlug: string;
  productName: string;
}) {
  const t = useTranslations();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setStatus("submitting");
    setErrorMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, productSlug, rating, title, body, authorName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || t.product.reviewSubmitError);
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setErrorMessage(t.product.reviewSubmitError);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-sage/30 bg-sage/10 p-5">
        <p className="font-semibold text-espresso">{t.product.reviewThanksTitle}</p>
        <p className="mt-1 text-sm text-espresso/70">{t.product.reviewThanksBody}</p>
      </div>
    );
  }

  const displayRating = hoverRating || rating;

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-tan/50 bg-white p-5">
      <p className="font-semibold text-espresso">{productName}</p>

      <div className="mt-3">
        <label className="block text-sm font-medium text-espresso/80">{t.product.yourRating}</label>
        <div className="mt-1 flex gap-1" role="radiogroup" aria-label={t.product.yourRating}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n}`}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(n)}
              className="p-0.5"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill={n <= displayRating ? "var(--color-terracotta)" : "none"} stroke="var(--color-terracotta)" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 2.5l2.9 6.02 6.6.87-4.85 4.6 1.25 6.56L12 17.6l-5.9 3.05 1.25-6.56-4.85-4.6 6.6-.87L12 2.5z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor={`name-${orderId}-${productSlug}`} className="block text-sm font-medium text-espresso/80">
          {t.product.yourName}
        </label>
        <input
          id={`name-${orderId}-${productSlug}`}
          type="text"
          required
          maxLength={80}
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-tan/60 px-3 py-2 text-sm focus:border-terracotta focus:outline-none"
        />
      </div>

      <div className="mt-3">
        <label htmlFor={`title-${orderId}-${productSlug}`} className="block text-sm font-medium text-espresso/80">
          {t.product.reviewTitleLabel}
        </label>
        <input
          id={`title-${orderId}-${productSlug}`}
          type="text"
          required
          maxLength={120}
          placeholder={t.product.reviewTitlePlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-tan/60 px-3 py-2 text-sm focus:border-terracotta focus:outline-none"
        />
      </div>

      <div className="mt-3">
        <label htmlFor={`body-${orderId}-${productSlug}`} className="block text-sm font-medium text-espresso/80">
          {t.product.reviewBodyLabel}
        </label>
        <textarea
          id={`body-${orderId}-${productSlug}`}
          required
          rows={3}
          maxLength={2000}
          placeholder={t.product.reviewBodyPlaceholder}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 w-full rounded-lg border border-tan/60 px-3 py-2 text-sm focus:border-terracotta focus:outline-none"
        />
      </div>

      {status === "error" && <p className="mt-2 text-sm text-rose">{errorMessage}</p>}

      <Button
        type="submit"
        size="sm"
        className="mt-4"
        disabled={status === "submitting" || rating === 0}
      >
        {status === "submitting" ? t.product.submittingReview : t.product.submitReview}
      </Button>
    </form>
  );
}
