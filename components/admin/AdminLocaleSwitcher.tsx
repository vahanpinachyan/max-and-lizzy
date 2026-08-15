"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE } from "@/lib/i18n/locales";
import type { AdminLocale } from "@/lib/admin/i18n";

// Shares the storefront's locale cookie (see lib/admin/i18n.ts), so this
// just needs to set it and refresh — no separate context/provider needed
// since every admin page is a server component reading the cookie fresh.
export function AdminLocaleSwitcher({ locale }: { locale: AdminLocale }) {
  const router = useRouter();

  function setLocale(next: AdminLocale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-tan/60 bg-white p-0.5 text-xs font-semibold">
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`rounded-full px-2.5 py-1 transition-colors ${locale === "en" ? "bg-wood text-white" : "text-espresso/60 hover:text-espresso"}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("hy")}
        aria-pressed={locale === "hy"}
        className={`rounded-full px-2.5 py-1 transition-colors ${locale === "hy" ? "bg-wood text-white" : "text-espresso/60 hover:text-espresso"}`}
      >
        ՀՅ
      </button>
    </div>
  );
}
