import type { Locale } from "@/lib/i18n/locales";
import { en, type Dictionary } from "./en";
import { hy } from "./hy";
import { ru } from "./ru";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { en, hy, ru };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
