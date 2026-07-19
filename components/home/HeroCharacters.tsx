"use client";

import { useState } from "react";
import Image from "next/image";

// Max and Lizzy are separate cropped images (split from the original combined
// artwork at the transparent gap between them) so each can react to its own
// hover independently, the same way a product photo scales up on hover.
// The container's aspect-ratio matches the source art's true proportions
// (1700x1665) so each crop — sized as a percentage of that width — renders
// at its native scale with no letterboxing.
const MAX_WIDTH_PCT = (826 / 1700) * 100;
const LIZZY_WIDTH_PCT = 100 - MAX_WIDTH_PCT;

export function HeroCharacters({ maxIntro, lizzyIntro }: { maxIntro: string; lizzyIntro: string }) {
  const [active, setActive] = useState<"max" | "lizzy" | null>(null);

  return (
    <div
      className="relative w-full max-w-[28rem] sm:max-w-[34rem] lg:max-w-[40rem]"
      style={{ aspectRatio: "1700 / 1665" }}
    >
      <button
        type="button"
        aria-label={maxIntro}
        onMouseEnter={() => setActive("max")}
        onMouseLeave={() => setActive((v) => (v === "max" ? null : v))}
        onFocus={() => setActive("max")}
        onBlur={() => setActive((v) => (v === "max" ? null : v))}
        className="absolute left-0 top-0 h-full cursor-pointer border-0 bg-transparent p-0"
        style={{ width: `${MAX_WIDTH_PCT}%` }}
      >
        <Image
          src="/images/hero-max-v1.png"
          alt="Illustrated portrait of Max"
          fill
          priority
          quality={95}
          className={`object-contain transition-transform duration-500 ease-out ${active === "max" ? "scale-105" : "scale-100"}`}
          sizes="(min-width: 1024px) 22vw, 44vw"
        />
      </button>
      <button
        type="button"
        aria-label={lizzyIntro}
        onMouseEnter={() => setActive("lizzy")}
        onMouseLeave={() => setActive((v) => (v === "lizzy" ? null : v))}
        onFocus={() => setActive("lizzy")}
        onBlur={() => setActive((v) => (v === "lizzy" ? null : v))}
        className="absolute right-0 top-0 h-full cursor-pointer border-0 bg-transparent p-0"
        style={{ width: `${LIZZY_WIDTH_PCT}%` }}
      >
        <Image
          src="/images/hero-lizzy-v1.png"
          alt="Illustrated portrait of Lizzy"
          fill
          priority
          quality={95}
          className={`object-contain transition-transform duration-500 ease-out ${active === "lizzy" ? "scale-105" : "scale-100"}`}
          sizes="(min-width: 1024px) 23vw, 46vw"
        />
      </button>

      {/* Bubbles are anchored by their bottom edge (where the tail is), just
          above each character's hair — so they grow upward with longer text
          instead of drifting away from the head. */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute bottom-[78%] left-[21%] w-[10.5rem] -translate-x-1/2 transition-all duration-200 ${
          active === "max" ? "translate-y-0 scale-100 opacity-100" : "translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="relative rounded-3xl border-2 border-sage/50 bg-cream px-4 py-2.5 text-xs font-semibold leading-snug text-espresso shadow-[0_4px_14px_rgba(61,43,31,0.15)]">
          {maxIntro}
          <span className="absolute -bottom-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[2px] border-b-2 border-r-2 border-sage/50 bg-cream" />
        </div>
      </div>
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute bottom-[90%] left-[75%] w-[10.5rem] -translate-x-1/2 transition-all duration-200 ${
          active === "lizzy" ? "translate-y-0 scale-100 opacity-100" : "translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="relative rounded-3xl border-2 border-rose/50 bg-cream px-4 py-2.5 text-xs font-semibold leading-snug text-espresso shadow-[0_4px_14px_rgba(61,43,31,0.15)]">
          {lizzyIntro}
          <span className="absolute -bottom-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[2px] border-b-2 border-r-2 border-rose/50 bg-cream" />
        </div>
      </div>
    </div>
  );
}
