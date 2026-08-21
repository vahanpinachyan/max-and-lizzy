"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Belt-and-suspenders scroll reset. Next.js already scrolls to top on
// navigation (see data-scroll-behavior="smooth" on <html> in this layout),
// but that only works cleanly if nothing else on the page is fighting it —
// a modal/drawer whose cleanup (restoring document.body's scroll lock)
// hasn't finished yet when the transition starts, an in-flight animation,
// etc. This runs after the new page has actually mounted, once pathname has
// settled, so it isn't racing against any of that.
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
