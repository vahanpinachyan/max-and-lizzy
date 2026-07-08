import "server-only";
import { prisma } from "@/lib/db";

export interface PromoCode {
  code: string;
  percentOff: number;
  description: string;
}

// Promo codes are managed from /admin now (see app/admin/promo-codes) so
// vouchers can be created without a code change + deploy.
export async function findPromoCode(input: string): Promise<PromoCode | null> {
  const normalized = input.trim().toUpperCase();
  if (!normalized) return null;
  const row = await prisma.promoCode.findUnique({ where: { code: normalized } });
  if (!row || !row.active) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
  return { code: row.code, percentOff: row.percentOff, description: row.description };
}
