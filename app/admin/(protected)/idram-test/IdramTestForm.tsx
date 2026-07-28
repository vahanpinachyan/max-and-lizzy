"use client";

import { useState } from "react";

export function IdramTestForm() {
  const [amount, setAmount] = useState("1000");
  const [description, setDescription] = useState("Max & Lizzy test payment");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState<{ successUrl: string; failUrl: string; resultUrl: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/idram-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      setUrls({ successUrl: body.successUrl, failUrl: body.failUrl, resultUrl: body.resultUrl });

      const form = document.createElement("form");
      form.method = "POST";
      form.action = body.actionUrl;
      for (const [name, value] of Object.entries<string>(body.fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm focus:outline-none";

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-tan/50 bg-white p-5">
        {error && (
          <p className="rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta-dark" role="alert">
            {error}
          </p>
        )}
        <label className="block">
          <span className="block text-sm font-semibold text-espresso">Amount (AMD)</span>
          <input
            type="number"
            min={1}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-espresso">Description</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-wood px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wood-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Redirecting to Idram…" : "Send test payment to Idram"}
        </button>
      </form>

      {urls && (
        <div className="rounded-2xl border border-tan/50 bg-white p-5 text-sm">
          <p className="font-semibold text-espresso">Give these three URLs to Idram:</p>
          <dl className="mt-2 space-y-1 text-espresso/80">
            <div>
              <dt className="inline font-semibold">SUCCESS_URL: </dt>
              <dd className="inline break-all">{urls.successUrl}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">FAIL_URL: </dt>
              <dd className="inline break-all">{urls.failUrl}</dd>
            </div>
            <div>
              <dt className="inline font-semibold">RESULT_URL: </dt>
              <dd className="inline break-all">{urls.resultUrl}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
