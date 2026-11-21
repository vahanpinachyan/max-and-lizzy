/**
 * The season's small drawn motifs, as inline SVG.
 *
 * They are vectors rather than pictures for three reasons: they stay sharp on
 * any screen, they weigh nothing next to the photographs the catalogue
 * already loads, and they take their colour from the Christmas tokens, so a
 * change to the palette carries through all of them at once.
 *
 * Every one of these is decoration — none carries meaning a visitor would
 * miss — so each is marked `aria-hidden`. The real artwork of Max and Lizzy
 * is never redrawn here; see public/christmas/NEEDED.md.
 */

type OrnamentProps = { className?: string };

/** Two leaves and three berries. The menu marker and the logo's lapel pin. */
export function HollySprig({ className = "" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 13c-2.6-.4-4.6-2-5.2-4.3C8.9 7.4 11.3 8 12.6 9.8 13.1 7.3 12.3 5 10.6 3.4c2.9-.4 5.3 1 6.2 3.5.9-1 2.2-1.6 3.6-1.6-.4 2.6-2.2 4.6-4.6 5.4 1.8.5 3 1.7 3.5 3.4-2.4.4-4.4-.3-5.7-1.9z"
        fill="var(--color-pine)"
      />
      <circle cx="10.4" cy="16.6" r="1.9" fill="var(--color-holly)" />
      <circle cx="14" cy="18.4" r="1.6" fill="var(--color-holly-dark)" />
      <circle cx="7.6" cy="19" r="1.4" fill="var(--color-holly)" />
    </svg>
  );
}

/** A tied ribbon bow, for the corner of a product card and the logo. */
export function RibbonBow({ className = "" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 40 28"
      width="34"
      height="24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M20 12C16.4 6.6 11.8 4 6.6 4.8 2.8 5.4 1.2 9 3.4 11.9c2 2.6 7.1 3.4 16.6 1.6z"
        fill="var(--color-holly)"
      />
      <path
        d="M20 12c3.6-5.4 8.2-8 13.4-7.2 3.8.6 5.4 4.2 3.2 7.1-2 2.6-7.1 3.4-16.6 1.6z"
        fill="var(--color-holly)"
      />
      {/* The darker tails read as the ribbon's underside. */}
      <path d="M18.4 14.6 11 26.2l7.6-5.1z" fill="var(--color-holly-dark)" />
      <path d="M21.6 14.6 29 26.2l-7.6-5.1z" fill="var(--color-holly-dark)" />
      <ellipse cx="20" cy="13" rx="3.4" ry="2.9" fill="var(--color-holly-dark)" />
      <ellipse cx="19.1" cy="12.2" rx="1.1" ry="0.9" fill="#fffaf0" opacity="0.35" />
    </svg>
  );
}

/** A small pine tree in a burlap pot, from the board's sticker sheet. */
export function PineTree({ className = "" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 48 64"
      width="48"
      height="64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M24 3 36 22H12z" fill="var(--color-pine)" />
      <path d="M24 14 39 36H9z" fill="var(--color-pine-light)" />
      <path d="M24 26 42 51H6z" fill="var(--color-pine)" />
      <path d="M19 51h10v6H19z" fill="#8f5c37" />
      <path d="M15 56h18l-2 7H17z" fill="#d9c4a0" />
      <circle cx="24" cy="4" r="2.6" fill="var(--color-gold)" />
      <circle cx="18" cy="33" r="1.7" fill="var(--color-holly)" />
      <circle cx="30" cy="44" r="1.7" fill="var(--color-holly)" />
      <circle cx="28" cy="30" r="1.5" fill="var(--color-gold)" />
    </svg>
  );
}

/** A knitted stocking. Hung in a row along the top of the footer. */
export function Stocking({
  className = "",
  color = "var(--color-holly)",
}: OrnamentProps & { color?: string }) {
  return (
    <svg
      viewBox="0 0 28 44"
      width="28"
      height="44"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 10h10v16c0 3 1.6 4.4 5 5.6 3.2 1.1 4.6 3 4 5.4-.6 2.4-3 3.6-6 3-5.4-1-9.4-3.4-11.4-7C7.4 29.6 8 24 8 10z"
        fill={color}
      />
      <rect x="5.4" y="3" width="15.2" height="8" rx="2.6" fill="#fffaf0" />
      {/* Two stitch lines are enough to say "knitted" at this size. */}
      <path
        d="M9 15h8M9.4 20h8.2"
        stroke="#fffaf0"
        strokeOpacity="0.45"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A six-point snowflake, for the snow-drift divider and small accents. */
export function Snowflake({ className = "" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      >
        <path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17" />
        <path d="M12 6.4 9.4 4.2M12 6.4l2.6-2.2M12 17.6l-2.6 2.2M12 17.6l2.6 2.2" />
      </g>
    </svg>
  );
}
