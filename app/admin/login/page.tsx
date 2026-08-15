import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminLocale, getAdminDictionary } from "@/lib/admin/i18n";
import { AdminLocaleSwitcher } from "@/components/admin/AdminLocaleSwitcher";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const admin = await getAdminSession();
  if (admin) redirect("/admin/products");

  const locale = await getAdminLocale();
  const t = getAdminDictionary(locale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-beige px-4">
      <div className="w-full max-w-sm rounded-3xl border border-tan/50 bg-cream p-8 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-espresso">{t.login.title}</h1>
          <AdminLocaleSwitcher locale={locale} />
        </div>
        <p className="mt-1 text-sm text-espresso/70">{t.login.subtitle}</p>
        <div className="mt-6">
          <LoginForm dict={t.login} />
        </div>
      </div>
    </div>
  );
}
