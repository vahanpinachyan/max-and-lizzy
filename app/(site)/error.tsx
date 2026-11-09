"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useI18n } from "@/lib/i18n/context";

// Shown when a storefront page throws — which, during the Neon outage, was
// every database-backed page at once. Error boundaries render inside the
// layout, so I18nProvider is available and this stays translated.
//
// Deliberately says the fault is ours rather than blaming the connection:
// the one time customers actually saw this, it was our database being
// suspended, and telling them to check their wifi would have been a lie.
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { dict: t } = useI18n();

  useEffect(() => {
    // The digest is what ties this to a line in the Vercel runtime logs.
    console.error("[storefront] render failed", error.digest ?? error.message);
  }, [error]);

  return (
    <Container className="py-20 sm:py-28">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="flex h-20 w-20 items-center justify-center rounded-full bg-terracotta/10 text-4xl"
        >
          🧸
        </span>
        <h1 className="mt-8 font-heading text-3xl font-bold text-espresso sm:text-4xl">
          {t.errorPages.errorTitle}
        </h1>
        <p className="mt-4 text-espresso/70">{t.errorPages.errorBody}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
          >
            {t.errorPages.errorRetry}
          </button>
          <Link
            href="/"
            className="rounded-full border border-tan bg-cream px-6 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-beige"
          >
            {t.errorPages.errorHome}
          </Link>
        </div>

        <p className="mt-10 text-sm text-espresso/60">
          {t.errorPages.contactPrompt}{" "}
          <Link href="/contact" className="font-semibold text-terracotta-dark underline underline-offset-4">
            {t.errorPages.contactLink}
          </Link>
        </p>

        {error.digest && (
          <p className="mt-6 font-mono text-xs text-espresso/40">#{error.digest}</p>
        )}
      </div>
    </Container>
  );
}
