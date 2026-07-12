"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireManagerAction } from "@/lib/admin/permissions";

export async function approveReview(id: string) {
  await requireManagerAction();
  await prisma.review.update({ where: { id }, data: { approved: true } });
  revalidatePath("/admin/reviews");
  revalidatePath("/shop");
}

export async function unapproveReview(id: string) {
  await requireManagerAction();
  await prisma.review.update({ where: { id }, data: { approved: false } });
  revalidatePath("/admin/reviews");
  revalidatePath("/shop");
}

export async function deleteReview(id: string) {
  await requireManagerAction();
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath("/shop");
}
