import type { Locale } from "@/lib/i18n/locales";

const dateFormatLocale: Record<Locale, string> = { en: "en-US", hy: "hy-AM", ru: "ru-RU" };

// Currency symbol/placement and digit grouping are both hardcoded rather
// than left to Intl's currency-style resolution — Node's and the browser's
// ICU data disagree on both the AMD display symbol and grouping behavior
// for hy-AM/ru-RU at some magnitudes, which produces a server/client
// hydration mismatch. Plain string manipulation is identical everywhere.
const currencyDisplay: Record<Locale, { symbol: string; prefix: boolean }> = {
  en: { symbol: "AMD", prefix: true },
  hy: { symbol: "֏", prefix: false },
  ru: { symbol: "AMD", prefix: false },
};

export function formatAmd(amount: number, locale: Locale = "en"): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const { symbol, prefix } = currencyDisplay[locale];
  return prefix ? `${symbol} ${grouped}` : `${grouped} ${symbol}`;
}

export function formatDate(iso: string, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(dateFormatLocale[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

const ageRangeLabels: Record<Locale, Record<string, string>> = {
  en: { "0-3": "0–3 years", "3-6": "3–6 years", "6-12": "6–12 years" },
  hy: { "0-3": "0–3 տարեկան", "3-6": "3–6 տարեկան", "6-12": "6–12 տարեկան" },
  ru: { "0-3": "0–3 года", "3-6": "3–6 лет", "6-12": "6–12 лет" },
};

export function ageRangeLabel(range: string, locale: Locale = "en"): string {
  return ageRangeLabels[locale][range] ?? range;
}
