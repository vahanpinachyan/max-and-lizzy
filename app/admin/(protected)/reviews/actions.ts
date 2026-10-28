"use server";

import { revalidatePath, updateTag } from "next/cache";
import { REVIEWS_CACHE_TAG } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";
import { requireManagerAction } from "@/lib/admin/permissions";

export async function approveReview(id: string) {
  await requireManagerAction();
  await prisma.review.update({ where: { id }, data: { approved: true } });
  updateTag(REVIEWS_CACHE_TAG);
  revalidatePath("/admin/reviews");
  revalidatePath("/shop");
}

export async function unapproveReview(id: string) {
  await requireManagerAction();
  await prisma.review.update({ where: { id }, data: { approved: false } });
  updateTag(REVIEWS_CACHE_TAG);
  revalidatePath("/admin/reviews");
  revalidatePath("/shop");
}

export async function deleteReview(id: string) {
  await requireManagerAction();
  await prisma.review.delete({ where: { id } });
  updateTag(REVIEWS_CACHE_TAG);
  revalidatePath("/admin/reviews");
  revalidatePath("/shop");
}
