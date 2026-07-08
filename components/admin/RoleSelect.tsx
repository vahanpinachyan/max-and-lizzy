"use client";

import { useTransition } from "react";
import { updateStaffRole } from "@/app/admin/(protected)/staff/actions";

export function RoleSelect({ id, role, disabled }: { id: string; role: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={role}
      disabled={disabled || pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          try {
            await updateStaffRole(id, next);
          } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to update role.");
            e.target.value = role;
          }
        });
      }}
      className="rounded-full border border-tan bg-white px-3 py-1 text-xs font-semibold text-espresso disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="cashier">Cashier</option>
      <option value="manager">Manager</option>
    </select>
  );
}
