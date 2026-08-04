"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession, destroySession } from "@/lib/admin/auth";

// Brute-force lockout: 5 wrong passwords in a row locks the account for 15
// minutes, tracked per AdminUser row (see prisma/schema.prisma). Resets to 0
// on any successful login.
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });

  if (admin?.lockedUntil && admin.lockedUntil.getTime() > Date.now()) {
    const minutesLeft = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
    return { error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.` };
  }

  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    if (admin) {
      const attempts = admin.failedLoginAttempts + 1;
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil: attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
        },
      });
    }
    return { error: "Incorrect email or password." };
  }

  if (admin.failedLoginAttempts > 0 || admin.lockedUntil) {
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  await createSession(admin.id);
  redirect("/admin/products");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
