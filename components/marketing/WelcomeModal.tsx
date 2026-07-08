"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "@/components/ui/Mascot";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/lib/i18n/context";

const STORAGE_KEY = "max-and-lizzy-welcome-seen";
const SHOW_DELAY_MS = 1800;
const WELCOME_CODE = "WELCOME5";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"form" | "loading" | "success" | "error">("form");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  // description starts empty and falls back to a translated default at
  // render time — see WELCOME_CODE.description usage below — until the DB
  // code (fetched below) resolves, e.g. on a fresh install before seeding.
  const [welcomeCode, setWelcomeCode] = useState({ code: WELCOME_CODE, description: "" });
  const closeRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations();
  const welcomeDescription = welcomeCode.description || t.welcomeModal.fallbackDescription;

  useEffect(() => {
    let seen = true;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      // ignore
    }
    if (seen) return;

    fetch(`/api/promo-codes?code=${WELCOME_CODE}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.promo) setWelcomeCode(data.promo);
      })
      .catch(() => {
        // keep the fallback code
      });

    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function markSeen() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  }

  function dismiss() {
    markSeen();
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "welcome-modal" }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      markSeen();
    } catch {
      setStatus("error");
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(welcomeCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the code is still visible to copy by hand
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-espresso/50"
            onClick={dismiss}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={t.welcomeModal.title}
            className="relative w-full max-w-md rounded-3xl bg-cream p-6 text-center shadow-2xl sm:p-8"
          >
            <button
              ref={closeRef}
              onClick={dismiss}
              aria-label={t.welcomeModal.close}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-espresso hover:bg-beige transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <Mascot className="mx-auto h-28 w-28" ariaLabel={t.mascot.ariaLabel} />

            {status === "success" ? (
              <>
                <h2 className="mt-4 text-2xl font-bold text-espresso">{t.welcomeModal.successTitle}</h2>
                <p className="mt-2 text-espresso/70">
                  {t.welcomeModal.successSubtitle} {welcomeDescription.toLowerCase()}:
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="rounded-full border-2 border-dashed border-terracotta px-5 py-2 text-lg font-bold tracking-wide text-terracotta-dark">
                    {welcomeCode.code}
                  </span>
                  <button
                    onClick={copyCode}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-wood text-white transition-colors hover:bg-wood-dark"
                    aria-label={t.welcomeModal.copyCodeAria}
                  >
                    {copied ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <rect x="9" y="9" width="12" height="12" rx="2" strokeWidth="2" />
                        <path d="M5 15V5a2 2 0 0 1 2-2h10" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-4 text-xs text-espresso/60">
                  {t.welcomeModal.successNote}
                </p>
                <Button className="mt-6 w-full" onClick={dismiss}>
                  {t.welcomeModal.startShopping}
                </Button>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-2xl font-bold text-espresso">{t.welcomeModal.title}</h2>
                <p className="mt-2 text-espresso/70">
                  {t.welcomeModal.subtitle}
                </p>
                <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3" noValidate>
                  <label htmlFor="welcome-email" className="sr-only">
                    {t.home.emailAddressLabel}
                  </label>
                  <input
                    id="welcome-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.welcomeModal.placeholder}
                    className="w-full rounded-full border border-tan bg-white px-4 py-2.5 text-center text-sm focus:outline-none"
                  />
                  <Button type="submit" disabled={status === "loading"} className="w-full">
                    {status === "loading" ? t.welcomeModal.sending : t.welcomeModal.subscribe}
                  </Button>
                </form>
                {status === "error" && (
                  <p className="mt-2 text-sm text-terracotta-dark" role="alert">
                    {t.welcomeModal.error}
                  </p>
                )}
                <button onClick={dismiss} className="mt-4 text-sm text-espresso/60 underline hover:text-terracotta-dark">
                  {t.welcomeModal.noThanks}
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
