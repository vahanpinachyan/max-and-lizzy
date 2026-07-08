"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether the header should be hidden (scrolling down, past the
 * reveal threshold) or shown (scrolling up, or near the top of the page).
 * Ignores tiny scroll jitters below `threshold` px so it doesn't flicker.
 */
export function useHeaderVisibility(threshold = 8, revealBefore = 96) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    function onScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastY.current;

      if (currentY <= revealBefore) {
        setHidden(false);
      } else if (Math.abs(delta) > threshold) {
        setHidden(delta > 0);
      }

      lastY.current = currentY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, revealBefore]);

  return hidden;
}
