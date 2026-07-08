import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const admin = await getAdminSession();
  if (admin) redirect("/admin/products");

  return (
    <div className="flex min-h-screen items-center justify-center bg-beige px-4">
      <div className="w-full max-w-sm rounded-3xl border border-tan/50 bg-cream p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-espresso">Max &amp; Lizzy Admin</h1>
        <p className="mt-1 text-sm text-espresso/70">Sign in to manage products, stock, and promo codes.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
