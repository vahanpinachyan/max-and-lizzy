"use client";

import { useActionState, useRef, useEffect } from "react";
import { createPromoCode } from "@/app/admin/(protected)/promo-codes/actions";

const inputClass = "w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm focus:outline-none";

export function PromoCodeForm() {
  const [state, formAction, pending] = useActionState(createPromoCode, { error: null });
  const formRef = useRef<HTMLFormElement>(null);
  const prevPending = useRef(pending);

  useEffect(() => {
    // Reset the form after a successful submit (pending: true -> false with no error).
    if (prevPending.current && !pending && !state.error) {
      formRef.current?.reset();
    }
    prevPending.current = pending;
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-2 gap-4 rounded-2xl border border-tan/50 bg-white p-5 sm:grid-cols-5 sm:items-end">
      <label className="block">
        <span className="block text-sm font-semibold text-espresso">Code</span>
        <input name="code" placeholder="WELCOME5" required className={`${inputClass} mt-1.5 uppercase`} />
      </label>
      <label className="block">
        <span className="block text-sm font-semibold text-espresso">% off</span>
        <input name="percentOff" type="number" min={1} max={100} required className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block sm:col-span-2">
        <span className="block text-sm font-semibold text-espresso">Description (shown to customers)</span>
        <input name="description" placeholder="5% off your first order" required className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block">
        <span className="block text-sm font-semibold text-espresso">Expires (optional)</span>
        <input name="expiresAt" type="date" className={`${inputClass} mt-1.5`} />
      </label>
      <div className="col-span-2 sm:col-span-5">
        {state.error && (
          <p className="mb-2 text-sm text-terracotta-dark" role="alert">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-wood px-6 py-2.5 text-sm font-semibold text-white hover:bg-wood-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating…" : "+ Create Code"}
        </button>
      </div>
    </form>
  );
}
