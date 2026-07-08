"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setFlag } from "@/app/admin/(protected)/products/actions";

type FlagKey = "featured" | "bestseller" | "newArrival";

const FLAG_META: Record<FlagKey, { label: string; className: string }> = {
  featured: { label: "Featured", className: "bg-terracotta/15 text-terracotta-dark" },
  bestseller: { label: "Bestseller", className: "bg-wood/15 text-wood-dark" },
  newArrival: { label: "New", className: "bg-sage/15 text-sage-dark" },
};

export function FlagsCell({
  productId,
  featured,
  bestseller,
  newArrival,
}: {
  productId: string;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
}) {
  const active: FlagKey[] = [
    ...(featured ? (["featured"] as const) : []),
    ...(bestseller ? (["bestseller"] as const) : []),
    ...(newArrival ? (["newArrival"] as const) : []),
  ];
  const inactive = (["featured", "bestseller", "newArrival"] as FlagKey[]).filter((f) => !active.includes(f));

  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function toggleFlag(flag: FlagKey, value: boolean) {
    startTransition(async () => {
      await setFlag(productId, flag, value);
      setOpen(false);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {active.map((flag) => (
        <button
          key={flag}
          type="button"
          disabled={pending}
          onClick={() => toggleFlag(flag, false)}
          title={`Remove "${FLAG_META[flag].label}"`}
          className={`group flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${FLAG_META[flag].className} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {FLAG_META[flag].label}
          <span className="inline-block w-2 text-center text-espresso/50 opacity-0 transition-opacity group-hover:opacity-100">✕</span>
        </button>
      ))}

      {inactive.length > 0 && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-tan text-xs text-espresso/50 hover:border-espresso/40 hover:text-espresso"
            aria-label="Add flag"
            aria-expanded={open}
          >
            +
          </button>
          {open && (
            <div className="absolute left-0 top-[calc(100%+0.25rem)] z-10 min-w-[8rem] rounded-xl border border-tan/60 bg-white p-1 shadow-lg">
              {inactive.map((flag) => (
                <button
                  key={flag}
                  type="button"
                  disabled={pending}
                  onClick={() => toggleFlag(flag, true)}
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-espresso hover:bg-beige disabled:cursor-not-allowed disabled:opacity-60"
                >
                  + {FLAG_META[flag].label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
