import "server-only";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";

// Two roles: "manager" (everything) and "cashier" (orders + customers only —
// no product/pricing/promo-code/staff access). Extend this if finer-grained
// permissions are ever needed.
export type AdminRole = "manager" | "cashier";

/** For Server Actions: throws if there's no valid session. Every mutating
 * action must call this (or requireManagerAction) — the page-level redirect
 * checks alone don't protect the action endpoint itself. */
export async function requireAdminSession() {
  const admin = await getAdminSession();
  if (!admin) throw new Error("Not authenticated.");
  return admin;
}

/** For Server Actions: throws unless the signed-in admin is a manager. */
export async function requireManagerAction() {
  const admin = await requireAdminSession();
  if (admin.role !== "manager") {
    throw new Error("This action requires a manager account.");
  }
  return admin;
}

/** For Server Component pages: redirects cashiers away from manager-only
 * screens (products, promo codes, staff) instead of throwing. */
export async function requireManagerSession() {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");
  if (admin.role !== "manager") redirect("/admin/orders");
  return admin;
}
