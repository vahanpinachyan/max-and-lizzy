"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/lib/i18n/context";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const t = useTranslations();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-sage/40 bg-sage/10 p-6 text-espresso" role="status">
        <p className="font-semibold">{t.contactForm.successTitle}</p>
        <p className="mt-1 text-sm text-espresso/70">{t.contactForm.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-espresso">
            {t.contactForm.name}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1.5 w-full rounded-xl border border-tan bg-white px-4 py-2.5 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-espresso">
            {t.contactForm.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1.5 w-full rounded-xl border border-tan bg-white px-4 py-2.5 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-semibold text-espresso">
          {t.contactForm.subject}
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          className="mt-1.5 w-full rounded-xl border border-tan bg-white px-4 py-2.5 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-espresso">
          {t.contactForm.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-1.5 w-full rounded-xl border border-tan bg-white px-4 py-2.5 focus:outline-none"
        />
      </div>
      <Button type="submit" size="lg" disabled={status === "loading"}>
        {status === "loading" ? t.contactForm.sending : t.contactForm.send}
      </Button>
      {status === "error" && (
        <p className="text-sm text-terracotta-dark" role="alert">
          {t.contactForm.error}
        </p>
      )}
    </form>
  );
}
