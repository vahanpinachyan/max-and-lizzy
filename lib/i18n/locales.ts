export const locales = ["en", "hy", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "ml-locale";

export const localeMeta: Record<Locale, { label: string; short: string }> = {
  en: { label: "English", short: "EN" },
  hy: { label: "Հայերեն", short: "ՀՅ" },
  ru: { label: "Русский", short: "RU" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
