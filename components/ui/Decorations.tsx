// Very light, decorative clouds and flowers used as a soft kid-friendly
// background texture throughout the site. Always aria-hidden and
// pointer-events-none — decorative only, never focal content.

export function Cloud({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 60" className={className} fill="var(--color-cream)">
      <ellipse cx="30" cy="38" rx="28" ry="18" />
      <ellipse cx="60" cy="26" rx="32" ry="24" />
      <ellipse cx="92" cy="38" rx="26" ry="16" />
    </svg>
  );
}

export function Flower({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className={className} fill="none">
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="20"
          cy="11"
          rx="6"
          ry="9"
          fill="var(--color-terracotta)"
          transform={`rotate(${angle} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="5" fill="var(--color-sage)" />
    </svg>
  );
}

/**
 * A ready-made scattering of clouds/flowers sized for a typical section.
 * Drop this as the first child of any `relative overflow-hidden` section
 * for a consistent, subtle dose of the motif. Pass `variant` to bias
 * toward clouds, flowers, or both.
 */
export function SectionDecorations({
  variant = "both",
  className = "",
}: {
  variant?: "both" | "clouds" | "flowers";
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {variant !== "flowers" && (
        <>
          <Cloud className="absolute left-[6%] top-6 h-auto w-20 opacity-25 sm:w-24" />
          <Cloud className="absolute right-[10%] top-10 h-auto w-16 opacity-20 sm:w-20" />
        </>
      )}
      {variant !== "clouds" && (
        <>
          <Flower className="absolute left-[14%] bottom-6 h-auto w-6 rotate-6 opacity-15" />
          <Flower className="absolute right-[16%] bottom-10 h-auto w-7 -rotate-12 opacity-15" />
        </>
      )}
    </div>
  );
}
