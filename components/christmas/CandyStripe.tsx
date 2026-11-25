/**
 * The candy-stripe rule from the board: thin red and cream diagonals, used as
 * a divider and as a border. Pure CSS (see globals.css) rather than an image,
 * so it stays sharp at any width and costs nothing to download.
 *
 * Decorative, so it is hidden from screen readers: it separates sections that
 * are already separated by their headings.
 */
export function CandyStripe({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`christmas-candy-stripe ${className}`} />;
}
