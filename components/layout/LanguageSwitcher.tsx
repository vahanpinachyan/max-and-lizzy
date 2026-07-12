"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { locales, localeMeta } from "@/lib/i18n/locales";
import { useI18n } from "@/lib/i18n/context";

export function LanguageSwitcher({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const { locale, setLocale, dict } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Lets Header keep itself pinned (not hidden-on-scroll) while this is
  // open — otherwise the header can translate off-screen out from under an
  // open dropdown, leaving it floating with no visible trigger.
  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={dict.languageSwitcher.label}
        className="flex h-10 items-center gap-1 rounded-full px-2.5 text-sm font-semibold text-espresso hover:bg-beige transition-colors"
      >
        {localeMeta[locale].short}
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="menu"
            aria-label={dict.languageSwitcher.label}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-30 min-w-[9rem] overflow-hidden rounded-2xl border border-tan/60 bg-white p-1.5 shadow-2xl"
          >
            {locales.map((code) => (
              <button
                key={code}
                role="menuitemradio"
                aria-checked={code === locale}
                onClick={() => {
                  setLocale(code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  code === locale ? "bg-beige font-semibold text-terracotta-dark" : "text-espresso hover:bg-beige"
                }`}
              >
                {localeMeta[code].label}
                {code === locale && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
