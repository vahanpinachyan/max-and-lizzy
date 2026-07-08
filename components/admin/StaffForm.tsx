"use client";

import { useActionState, useRef, useEffect } from "react";
import { createStaff } from "@/app/admin/(protected)/staff/actions";

const inputClass = "w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm focus:outline-none";

export function StaffForm() {
  const [state, formAction, pending] = useActionState(createStaff, { error: null });
  const formRef = useRef<HTMLFormElement>(null);
  const prevPending = useRef(pending);

  useEffect(() => {
    if (prevPending.current && !pending && !state.error) {
      formRef.current?.reset();
    }
    prevPending.current = pending;
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-2 gap-4 rounded-2xl border border-tan/50 bg-white p-5 sm:grid-cols-5 sm:items-end">
      <label className="block">
        <span className="block text-sm font-semibold text-espresso">Name</span>
        <input name="name" placeholder="Ani Petrosyan" required className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block">
        <span className="block text-sm font-semibold text-espresso">Email</span>
        <input name="email" type="email" placeholder="ani@maxandlizzy.com" required className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block">
        <span className="block text-sm font-semibold text-espresso">Password</span>
        <input name="password" type="password" minLength={8} required className={`${inputClass} mt-1.5`} />
      </label>
      <label className="block">
        <span className="block text-sm font-semibold text-espresso">Role</span>
        <select name="role" defaultValue="cashier" className={`${inputClass} mt-1.5`}>
          <option value="cashier">Cashier</option>
          <option value="manager">Manager</option>
        </select>
      </label>
      <div className="col-span-2 sm:col-span-1">
        {state.error && (
          <p className="mb-2 text-sm text-terracotta-dark" role="alert">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-wood px-6 py-2.5 text-sm font-semibold text-white hover:bg-wood-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating…" : "+ Add Staff"}
        </button>
      </div>
    </form>
  );
}
