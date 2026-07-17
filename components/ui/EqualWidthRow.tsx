"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

// Sizes its direct children to match the widest one. Runs on every render
// (not just mount) so it re-measures when translated text changes length
// after a locale switch, instead of carrying over a width tuned for English.
export function EqualWidthRow({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    const items = Array.from(container.children) as HTMLElement[];
    items.forEach((el) => {
      el.style.width = "";
    });
    const max = Math.max(...items.map((el) => el.getBoundingClientRect().width));
    items.forEach((el) => {
      el.style.width = `${max}px`;
    });
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
