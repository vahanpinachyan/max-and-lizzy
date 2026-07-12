import type { ReactNode } from "react";
import clsx from "clsx";

const VARIANTS = {
  sage: "bg-sage/15 text-sage-dark",
  terracotta: "bg-terracotta/15 text-terracotta-dark",
  wood: "bg-wood/15 text-wood-dark",
  neutral: "bg-beige text-espresso",
  rose: "bg-rose text-white shadow-sm",
};

// Solid, opaque variants for badges that sit directly on top of a product
// photo (e.g. ProductCard's corner badges) -- the soft translucent VARIANTS
// above blend into busy photo backgrounds and become unreadable, so these
// always get a solid fill + shadow to stay legible regardless of what's
// behind them.
const ON_IMAGE_VARIANTS = {
  sage: "bg-sage-dark text-white shadow-sm",
  terracotta: "bg-terracotta-dark text-white shadow-sm",
  wood: "bg-wood-dark text-white shadow-sm",
  neutral: "bg-espresso text-white shadow-sm",
  rose: "bg-rose text-white shadow-sm",
};

export function Badge({
  children,
  variant = "neutral",
  onImage = false,
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  onImage?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        onImage ? ON_IMAGE_VARIANTS[variant] : VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
