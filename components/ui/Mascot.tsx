import Image from "next/image";

/**
 * The Max & Lizzy mascot bear, cropped from the brand logo artwork, shown
 * in empty cart/wishlist states and the welcome modal.
 */
export function Mascot({ className = "h-32 w-32", ariaLabel }: { className?: string; ariaLabel?: string }) {
  return (
    <span className={`relative inline-block ${className}`} role="img" aria-label={ariaLabel ?? "Max & Lizzy mascot bear"}>
      <Image src="/images/mascot-bear-v2.png" alt="" fill className="object-contain" sizes="160px" />
    </span>
  );
}
