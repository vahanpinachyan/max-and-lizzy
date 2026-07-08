/**
 * A simple placeholder mascot — a friendly bear, in the same flat/rounded
 * visual language as the rest of the site's iconwork. Meant to hold the
 * spot for real illustrated Max & Lizzy character art later (see README).
 */
export function Mascot({ className = "h-32 w-32", ariaLabel }: { className?: string; ariaLabel?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} role="img" aria-label={ariaLabel ?? "Max & Lizzy mascot bear, waving"}>
      {/* ears */}
      <circle cx="52" cy="42" r="16" fill="var(--color-wood)" />
      <circle cx="108" cy="42" r="16" fill="var(--color-wood)" />
      <circle cx="52" cy="42" r="8" fill="var(--color-beige)" />
      <circle cx="108" cy="42" r="8" fill="var(--color-beige)" />

      {/* head */}
      <circle cx="80" cy="66" r="38" fill="var(--color-terracotta)" />

      {/* muzzle */}
      <ellipse cx="80" cy="76" rx="18" ry="14" fill="var(--color-beige)" />
      <circle cx="80" cy="70" r="4" fill="var(--color-espresso)" />
      <path d="M80 74 Q80 80 74 80" stroke="var(--color-espresso)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M72 84 Q80 90 88 84" stroke="var(--color-espresso)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* eyes */}
      <circle cx="66" cy="58" r="4" fill="var(--color-espresso)" />
      <circle cx="94" cy="58" r="4" fill="var(--color-espresso)" />
      <circle cx="67.5" cy="56.5" r="1.3" fill="white" />
      <circle cx="95.5" cy="56.5" r="1.3" fill="white" />

      {/* body */}
      <rect x="50" y="98" width="60" height="50" rx="24" fill="var(--color-wood)" />
      <ellipse cx="80" cy="120" rx="16" ry="12" fill="var(--color-beige)" />

      {/* left arm, resting */}
      <ellipse cx="48" cy="118" rx="10" ry="16" fill="var(--color-wood)" transform="rotate(20 48 118)" />

      {/* right arm, waving */}
      <ellipse cx="118" cy="96" rx="10" ry="18" fill="var(--color-wood)" transform="rotate(-35 118 96)" />
    </svg>
  );
}
