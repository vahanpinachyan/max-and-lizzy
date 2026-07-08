import type { ReactNode } from "react";
import clsx from "clsx";

const VARIANTS = {
  sage: "bg-sage/15 text-sage-dark",
  terracotta: "bg-terracotta/15 text-terracotta-dark",
  wood: "bg-wood/15 text-wood-dark",
  neutral: "bg-beige text-espresso",
  rose: "bg-rose text-white shadow-sm",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
