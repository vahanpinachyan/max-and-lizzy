"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateOrderStatus } from "@/app/admin/(protected)/orders/actions";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";
import type { AdminDictionary } from "@/lib/admin/i18n";

// Changing the status now automatically emails the customer (see
// updateOrderStatus), so a stray click here sends a real email to a real
// person. Staff confirm the change first instead of it firing immediately.
export function OrderStatusSelect({
  orderId,
  status,
  dict,
}: {
  orderId: string;
  status: string;
  dict: AdminDictionary["orderDetail"] & { statusLabels: AdminDictionary["orderStatus"] };
}) {
  const [pending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [result, setResult] = useState<{ sent: boolean; reason?: string } | null>(null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const displayedStatus = pendingStatus ?? (status as OrderStatus);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function confirmChange() {
    if (!pendingStatus) return;
    const next = pendingStatus;
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, next);
      setResult(res);
      setPendingStatus(null);
    });
  }

  return (
    <div>
      <div className="flex justify-end">
        <div className="relative" ref={wrapRef}>
          <button
            type="button"
            disabled={pending}
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={open}
            className="flex items-center gap-2 rounded-full border border-tan bg-white px-4 py-2 text-sm font-semibold text-espresso hover:bg-beige transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {dict.statusLabels[displayedStatus]}
            <motion.svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                role="menu"
                aria-label="Order status"
                className="absolute right-0 top-[calc(100%+0.5rem)] z-30 min-w-[11rem] overflow-hidden rounded-2xl border border-tan/60 bg-white p-1.5 shadow-2xl"
              >
                {ORDER_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="menuitemradio"
                    aria-checked={s === displayedStatus}
                    onClick={() => {
                      setResult(null);
                      setPendingStatus(s);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      s === displayedStatus ? "bg-beige font-semibold text-terracotta-dark" : "text-espresso hover:bg-beige"
                    }`}
                  >
                    {dict.statusLabels[s]}
                    {s === displayedStatus && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {pendingStatus && (
        <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-terracotta/40 bg-terracotta/5 px-3 py-2 text-sm">
          <span className="text-espresso">
            {dict.confirmChangeStatusPrefix} <strong>{dict.statusLabels[pendingStatus]}</strong>
            {dict.confirmChangeStatusSuffix}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={confirmChange}
              className="rounded-full bg-terracotta px-3 py-1 text-xs font-semibold text-white hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? dict.updating : dict.confirm}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setPendingStatus(null)}
              className="rounded-full border border-tan px-3 py-1 text-xs font-semibold text-espresso hover:bg-beige disabled:cursor-not-allowed disabled:opacity-60"
            >
              {dict.cancel}
            </button>
          </div>
        </div>
      )}

      {result && (
        <p className={`mt-2 text-sm ${result.sent ? "text-sage-dark" : "text-terracotta-dark"}`} role="status">
          {result.sent ? dict.statusUpdatedNotified : `${dict.statusUpdatedNoEmail}: ${result.reason ?? "unknown error."}`}
        </p>
      )}
    </div>
  );
}
