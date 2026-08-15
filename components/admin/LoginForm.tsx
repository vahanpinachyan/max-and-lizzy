"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import type { AdminDictionary } from "@/lib/admin/i18n";

export function LoginForm({ dict }: { dict: AdminDictionary["login"] }) {
  const [state, formAction, pending] = useActionState(loginAction, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-espresso">
          {dict.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-1.5 w-full rounded-xl border border-tan bg-white px-4 py-2.5 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-espresso">
          {dict.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-xl border border-tan bg-white px-4 py-2.5 focus:outline-none"
        />
      </div>
      {state.error && (
        <p className="text-sm text-terracotta-dark" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-wood px-6 py-3 font-semibold text-white transition-colors hover:bg-wood-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? dict.signingIn : dict.signIn}
      </button>
    </form>
  );
}
