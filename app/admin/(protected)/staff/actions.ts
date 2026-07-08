"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/admin/auth";
import { requireManagerAction } from "@/lib/admin/permissions";

export async function createStaff(_prevState: { error: string | null }, formData: FormData) {
  await requireManagerAction();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "cashier");

  if (!email) return { error: "Enter an email address." };
  if (!name) return { error: "Enter a name." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (role !== "manager" && role !== "cashier") return { error: "Invalid role." };

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return { error: `An account with "${email}" already exists.` };

  const passwordHash = await hashPassword(password);
  await prisma.adminUser.create({ data: { email, name, passwordHash, role } });
  revalidatePath("/admin/staff");
  return { error: null };
}

export async function updateStaffRole(id: string, role: string) {
  const admin = await requireManagerAction();
  if (role !== "manager" && role !== "cashier") {
    throw new Error("Invalid role.");
  }
  if (admin.id === id && role !== "manager") {
    throw new Error("You cannot remove your own manager access.");
  }
  await prisma.adminUser.update({ where: { id }, data: { role } });
  revalidatePath("/admin/staff");
}

export async function deleteStaff(id: string) {
  const admin = await requireManagerAction();
  if (admin.id === id) {
    throw new Error("You cannot delete your own account.");
  }
  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/admin/staff");
}
