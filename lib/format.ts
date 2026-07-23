import type { Locale } from "@/lib/i18n/locales";

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

// Month names are hardcoded for the same reason as formatAmd above — this
// browser's ICU data has no hy-AM locale data and silently falls back to
// French month names for Intl.DateTimeFormat, rather than erroring.
const monthNames: Record<Locale, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  hy: ["հունվարի", "փետրվարի", "մարտի", "ապրիլի", "մայիսի", "հունիսի", "հուլիսի", "օգոստոսի", "սեպտեմբերի", "հոկտեմբերի", "նոյեմբերի", "դեկտեմբերի"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
};

export function formatDate(iso: string, locale: Locale = "en"): string {
  const d = new Date(iso);
  const day = d.getUTCDate();
  const month = monthNames[locale][d.getUTCMonth()];
  const year = d.getUTCFullYear();
  if (locale === "hy") return `${day} ${month}, ${year} թ.`;
  if (locale === "ru") return `${day} ${month} ${year} г.`;
  return `${month} ${day}, ${year}`;
}

const ageRangeLabels: Record<Locale, Record<string, string>> = {
  en: { "0-3": "0–3 years", "3-6": "3–6 years", "6-12": "6–12 years" },
  hy: { "0-3": "0–3 տարեկան", "3-6": "3–6 տարեկան", "6-12": "6–12 տարեկան" },
  ru: { "0-3": "0–3 года", "3-6": "3–6 лет", "6-12": "6–12 лет" },
};

export function ageRangeLabel(range: string, locale: Locale = "en"): string {
  return ageRangeLabels[locale][range] ?? range;
}

// Product materials are free-text on the Product row (English only), so
// translated labels are looked up here rather than stored per-locale.
// Filtering still matches on the original English value — only the
// displayed label changes.
const materialLabels: Record<Locale, Record<string, string>> = {
  en: {},
  hy: {
    Cardboard: "Ստվարաթուղթ",
    "Cardboard pattern cards": "Ստվարաթղթե նմուշի քարտեր",
    Cork: "Խցան",
    Fabric: "Գործվածք",
    "Felt wool": "Ֆետրե բուրդ",
    "Maple wood": "Թխկու փայտ",
    Metal: "Մետաղ",
    "Metal tone bars": "Մետաղական հնչողական սալիկներ",
    "Metal wire": "Մետաղալար",
    Plastic: "Պլաստիկ",
    Silicone: "Սիլիկոն",
    Sisal: "Սիզալ",
    "Solid beechwood": "Զանգվածեղեն բոխու փայտ",
    "Solid wood": "Զանգվածեղեն փայտ",
    Wood: "Փայտ",
  },
  ru: {
    Cardboard: "Картон",
    "Cardboard pattern cards": "Картонные карточки-образцы",
    Cork: "Пробка",
    Fabric: "Ткань",
    "Felt wool": "Фетр",
    "Maple wood": "Древесина клёна",
    Metal: "Металл",
    "Metal tone bars": "Металлические тон-пластины",
    "Metal wire": "Металлическая проволока",
    Plastic: "Пластик",
    Silicone: "Силикон",
    Sisal: "Сизаль",
    "Solid beechwood": "Массив бука",
    "Solid wood": "Массив дерева",
    Wood: "Дерево",
  },
};

export function materialLabel(material: string, locale: Locale = "en"): string {
  return materialLabels[locale][material] ?? material;
}

// Safety info bullets are also free-text on the Product row (English only).
const safetyInfoLabels: Record<Locale, Record<string, string>> = {
  en: {},
  hy: {
    "Tested to ASTM F963 & EN71 safety standards": "Փորձարկված է ASTM F963 և EN71 անվտանգության ստանդարտներով",
    "Non-toxic, water-based paints and finishes": "Ոչ թունավոր, ջրահիմք ներկեր և ծածկույթներ",
    "No small parts hazard for stated age range": "Չունի մանր մասերի վտանգ նշված տարիքային խմբի համար",
  },
  ru: {
    "Tested to ASTM F963 & EN71 safety standards": "Проверено на соответствие стандартам безопасности ASTM F963 и EN71",
    "Non-toxic, water-based paints and finishes": "Нетоксичные краски и покрытия на водной основе",
    "No small parts hazard for stated age range": "Не содержит мелких деталей, опасных для указанного возраста",
  },
};

export function safetyInfoLabel(info: string, locale: Locale = "en"): string {
  return safetyInfoLabels[locale][info] ?? info;
}
