"use client";

export function DeleteButton({ action, label, confirmMessage }: { action: () => void; label: string; confirmMessage: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <button type="submit" className="text-sm text-espresso/50 hover:text-terracotta-dark">
        {label}
      </button>
    </form>
  );
}
