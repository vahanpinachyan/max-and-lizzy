"use client";

import { useState, useTransition } from "react";
import { sendStatusEmailAction } from "@/app/admin/(protected)/orders/actions";

export function SendOrderEmailButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ sent: boolean; reason?: string } | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setResult(null);
          startTransition(async () => {
            const res = await sendStatusEmailAction(orderId);
            setResult(res);
          });
        }}
        className="rounded-full border-2 border-espresso px-5 py-2 text-sm font-semibold text-espresso transition-colors hover:bg-espresso hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Sending…" : "Email customer this status"}
      </button>
      {result && (
        <p className={`mt-2 text-sm ${result.sent ? "text-sage-dark" : "text-terracotta-dark"}`} role="status">
          {result.sent ? "Email sent." : result.reason ?? "Email not sent."}
        </p>
      )}
    </div>
  );
}
