/**
 * A drift of snow banked up between two sections.
 *
 * The wave is stretched to the page width rather than tiled, so the drift is
 * one continuous bank instead of a repeating scallop. Stretching distorts the
 * curve, which for a snowdrift is not a defect — a drift is not a regular
 * shape, and the distortion is invisible.
 *
 * It is a divider, not content, so it is hidden from screen readers; the
 * sections either side are already separated by their own headings.
 */
export function SnowDrift({ className = "" }: { className?: string }) {
  return (
    <div className={`christmas-drift ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 70" preserveAspectRatio="none" fill="none">
        <path
          d="M0 70V34c120-18 210 6 318 14 108 8 168-26 282-28 114-2 186 30 300 26 114-4 186-26 300-14v38z"
          fill="#fffaf0"
        />
        {/* A second, paler bank behind, so the drift has some depth rather
            than reading as a single cut-out wave. */}
        <path
          d="M0 70V50c140-14 236 10 356 12 120 2 196-20 304-18 108 2 180 22 290 16 110-6 180-18 250-10v20z"
          fill="#ffffff"
          opacity="0.75"
        />
      </svg>
    </div>
  );
}
