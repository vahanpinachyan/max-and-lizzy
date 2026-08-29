"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Sidebar nav (app/admin/(protected)/layout.tsx's <aside>) is hidden below
// the sm breakpoint, so this is the only way to reach Orders/Products/etc.
// on mobile. `children` is server-rendered nav markup passed straight
// through — this component only owns the open/close toggle.
export function AdminMobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-espresso hover:bg-beige"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>
      {open && (
        <nav
          className="fixed inset-x-0 top-[57px] z-40 max-h-[calc(100vh-57px)] overflow-y-auto border-b border-tan/50 bg-cream px-3 py-3 shadow-lg"
          onClick={() => setOpen(false)}
        >
          {children}
        </nav>
      )}
    </div>
  );
}
