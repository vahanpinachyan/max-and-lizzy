"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireManagerAction } from "@/lib/admin/permissions";

export async function createPromoCode(_prevState: { error: string | null }, formData: FormData) {
  await requireManagerAction();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const percentOff = Number(formData.get("percentOff"));
  const description = String(formData.get("description") ?? "").trim();
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();

  if (!code) return { error: "Enter a code." };
  if (!Number.isFinite(percentOff) || percentOff <= 0 || percentOff > 100) {
    return { error: "Percent off must be between 1 and 100." };
  }
  if (!description) return { error: "Enter a short description shown to customers." };

  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) return { error: `Code "${code}" already exists.` };

  await prisma.promoCode.create({
    data: {
      code,
      percentOff: Math.round(percentOff),
      description,
      active: true,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
    },
  });
  revalidatePath("/admin/promo-codes");
  return { error: null };
}

export async function toggleActive(id: string, active: boolean) {
  await requireManagerAction();
  await prisma.promoCode.update({ where: { id }, data: { active } });
  revalidatePath("/admin/promo-codes");
}

export async function deletePromoCode(id: string) {
  await requireManagerAction();
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promo-codes");
}
