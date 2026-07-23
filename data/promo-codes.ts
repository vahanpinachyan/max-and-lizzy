import "server-only";
import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n/locales";

export interface PromoCode {
  code: string;
  percentOff: number;
  description: string;
}

function pick(locale: Locale, en: string, hy: string | null, ru: string | null): string {
  if (locale === "hy") return hy || en;
  if (locale === "ru") return ru || en;
  return en;
}

// Promo codes are managed from /admin now (see app/admin/promo-codes) so
// vouchers can be created without a code change + deploy.
export async function findPromoCode(input: string, locale: Locale = "en"): Promise<PromoCode | null> {
  const normalized = input.trim().toUpperCase();
  if (!normalized) return null;
  const row = await prisma.promoCode.findUnique({ where: { code: normalized } });
  if (!row || !row.active) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
  return {
    code: row.code,
    percentOff: row.percentOff,
    description: pick(locale, row.description, row.descriptionHy, row.descriptionRu),
  };
}
