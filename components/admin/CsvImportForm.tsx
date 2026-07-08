"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importProductsFromCsv, type CsvImportResult } from "@/app/admin/(protected)/products/actions";

export function CsvImportForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await importProductsFromCsv(formData);
      setResult(res);
      if (!res.error) {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-2xl border border-tan/50 bg-white p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-espresso"
      >
        Import products from CSV
        <span className="text-espresso/50">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-4">
          <p className="text-xs text-espresso/60">
            Upload a CSV file to create or update products in bulk — matched by &quot;slug&quot;, so
            re-uploading the same file updates existing products instead of duplicating them.{" "}
            <a href="/product-import-template.csv" download className="font-semibold text-terracotta-dark hover:underline">
              Download the template
            </a>{" "}
            to see the expected columns. Have an Excel workbook? Save/export it as CSV first
            (File → Save As → CSV in Excel, or File → Download → CSV in Google Sheets).
          </p>

          <form ref={formRef} onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-center gap-3">
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
              className="text-sm text-espresso file:mr-3 file:rounded-full file:border-0 file:bg-beige file:px-4 file:py-2 file:text-sm file:font-semibold file:text-espresso hover:file:bg-tan/50"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-wood px-5 py-2 text-sm font-semibold text-white hover:bg-wood-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Importing…" : "Import"}
            </button>
          </form>

          {result && (
            <div className="mt-3 text-sm">
              {result.error ? (
                <p className="text-terracotta-dark">{result.error}</p>
              ) : (
                <div>
                  <p className="font-semibold text-sage-dark">
                    {result.created} created, {result.updated} updated
                    {result.skipped.length > 0 ? `, ${result.skipped.length} skipped` : ""}.
                  </p>
                  {result.skipped.length > 0 && (
                    <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-terracotta-dark">
                      {result.skipped.map((s, i) => (
                        <li key={i}>Row {s.row}: {s.reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
