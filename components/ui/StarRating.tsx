export function StarRating({
  rating,
  size = 18,
  showValue = false,
  ariaLabel,
}: {
  rating: number;
  size?: number;
  showValue?: boolean;
  ariaLabel?: string;
}) {
  const full = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={ariaLabel ?? `Rated ${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < full ? "var(--color-terracotta)" : "none"}
          stroke="var(--color-terracotta)"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M12 2.5l2.9 6.02 6.6.87-4.85 4.6 1.25 6.56L12 17.6l-5.9 3.05 1.25-6.56-4.85-4.6 6.6-.87L12 2.5z" />
        </svg>
      ))}
      {showValue && <span className="ml-1 text-sm text-espresso/70">{rating.toFixed(1)}</span>}
    </span>
  );
}
