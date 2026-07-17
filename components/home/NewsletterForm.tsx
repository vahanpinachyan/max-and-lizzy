"use client";

import { useState, type FormEvent } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/lib/i18n/context";
import { identifyOmnisendContact } from "@/lib/omnisend-client";

export function NewsletterForm({ variant = "section" }: { variant?: "section" | "footer" }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [email, setEmail] = useState("");
  const t = useTranslations();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      identifyOmnisendContact(email);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  const isFooter = variant === "footer";

  return (
    <div className={clsx(isFooter && "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between")}>
      <div>
        <h2 className={clsx("font-heading font-bold", isFooter ? "text-lg text-cream" : "text-2xl text-espresso")}>
          {t.home.newsletterTitle}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex w-full max-w-md gap-2 sm:mt-0" noValidate>
        <label htmlFor="newsletter-email" className="sr-only">
          {t.home.emailAddressLabel}
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.home.newsletterPlaceholder}
          className={clsx(
            "w-full rounded-full border px-4 py-2.5 text-sm focus:outline-none",
            isFooter
              ? "border-cream/30 bg-cream/10 text-cream placeholder:text-cream/50"
              : "border-tan bg-white text-espresso placeholder:text-espresso/40"
          )}
        />
        <Button type="submit" size="sm" disabled={status === "loading"}>
          {status === "loading" ? t.home.newsletterJoining : t.home.newsletterSubscribe}
        </Button>
      </form>
      <div aria-live="polite" className="mt-2 text-sm">
        {status === "success" && (
          <p className={isFooter ? "text-sage-light" : "text-sage-dark"}>{t.home.newsletterSuccess}</p>
        )}
        {status === "error" && <p className="text-terracotta-dark">{t.home.newsletterError}</p>}
      </div>
    </div>
  );
}
