import type { Locale } from "@/lib/i18n/locales";

const dateFormatLocale: Record<Locale, string> = { en: "en-US", hy: "hy-AM", ru: "ru-RU" };

export function formatAmd(amount: number, locale: Locale = "en"): string {
  return new Intl.NumberFormat(dateFormatLocale[locale], {
    style: "currency",
    currency: "AMD",
    maximumFractionDigits: 0,
  }).format(amount);
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
