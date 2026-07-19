"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatAmd } from "@/lib/format";
import { deleteProduct, toggleStock, bulkUpdateProducts, type BulkFlagUpdates } from "@/app/admin/(protected)/products/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { FlagsCell } from "@/components/admin/FlagsCell";
import { isLowStock } from "@/lib/inventory";

export type ProductRow = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  priceAmd: number;
  compareAtPriceAmd: number | null;
  inStock: boolean;
  stockQuantity: number | null;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  pickBy: string | null;
  image: string | null;
};

const FLAG_OPTIONS: { key: keyof BulkFlagUpdates; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "bestseller", label: "Bestseller" },
  { key: "newArrival", label: "New" },
];

export function BulkProductsTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [priceMode, setPriceMode] = useState<"set" | "adjustPercent">("set");
  const [priceValue, setPriceValue] = useState("");
  const [flagAction, setFlagAction] = useState<"add" | "remove">("add");
  const [flagKey, setFlagKey] = useState<keyof BulkFlagUpdates>("featured");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLDivElement>(null);

  const allSelected = products.length > 0 && selected.size === products.length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === products.length ? new Set() : new Set(products.map((p) => p.id))));
  }

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  function applyPrice() {
    setError(null);
    const value = Number(priceValue);
    if (!Number.isFinite(value)) {
      setError(priceMode === "set" ? "Enter a valid price." : "Enter a valid percentage.");
      return;
    }
    startTransition(async () => {
      const result = await bulkUpdateProducts({ ids: selectedIds, priceMode, priceValue: value });
      if (result.error) setError(result.error);
      else {
        setPriceValue("");
        router.refresh();
      }
    });
  }

  function applyFlag() {
    setError(null);
    startTransition(async () => {
      const flags: BulkFlagUpdates = { [flagKey]: flagAction === "add" };
      const result = await bulkUpdateProducts({ ids: selectedIds, flags });
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div>
      {selected.size > 0 && (
        <div ref={formRef} className="mb-4 rounded-2xl border border-wood/40 bg-wood/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-espresso">
              {selected.size} product{selected.size === 1 ? "" : "s"} selected
            </p>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs font-semibold text-espresso/60 hover:text-espresso"
            >
              Clear selection
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-4">
            <div className="flex items-end gap-2">
              <label className="block">
                <span className="block text-xs font-semibold text-espresso">Price</span>
                <select
                  value={priceMode}
                  onChange={(e) => setPriceMode(e.target.value as "set" | "adjustPercent")}
                  className="mt-1 rounded-xl border border-tan bg-white px-2 py-2 text-sm"
                >
                  <option value="set">Set to (AMD)</option>
                  <option value="adjustPercent">Adjust by (%)</option>
                </select>
              </label>
              <input
                type="number"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                placeholder={priceMode === "set" ? "e.g. 12000" : "e.g. -10 or 15"}
                className="mt-1 w-36 rounded-xl border border-tan bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={applyPrice}
                disabled={pending || !priceValue}
                className="rounded-full bg-wood px-4 py-2 text-sm font-semibold text-white hover:bg-wood-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                Apply price
              </button>
            </div>

            <div className="flex items-end gap-2">
              <label className="block">
                <span className="block text-xs font-semibold text-espresso">Tag</span>
                <select
                  value={flagAction}
                  onChange={(e) => setFlagAction(e.target.value as "add" | "remove")}
                  className="mt-1 rounded-xl border border-tan bg-white px-2 py-2 text-sm"
                >
                  <option value="add">Add</option>
                  <option value="remove">Remove</option>
                </select>
              </label>
              <select
                value={flagKey}
                onChange={(e) => setFlagKey(e.target.value as keyof BulkFlagUpdates)}
                className="mt-1 rounded-xl border border-tan bg-white px-2 py-2 text-sm"
              >
                {FLAG_OPTIONS.map((f) => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyFlag}
                disabled={pending}
                className="rounded-full bg-wood px-4 py-2 text-sm font-semibold text-white hover:bg-wood-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                Apply tag
              </button>
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-terracotta-dark">{error}</p>}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-tan/50 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-tan/50 bg-beige/50 text-xs font-bold uppercase text-espresso/70">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all products" />
              </th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tan/30">
            {products.map((p) => {
              const boundToggle = toggleStock.bind(null, p.id, !p.inStock);
              const boundDelete = deleteProduct.bind(null, p.id);
              return (
                <tr key={p.id} className={selected.has(p.id) ? "bg-wood/5" : isLowStock(p) ? "bg-terracotta/5" : undefined}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleOne(p.id)}
                      aria-label={`Select ${p.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-beige">
                        {p.image && <Image src={p.image} alt="" fill className="object-cover" sizes="48px" />}
                      </div>
                      <div>
                        <Link href={`/admin/products/${p.id}/edit`} className="font-semibold text-espresso hover:text-terracotta-dark">
                          {p.name}
                        </Link>
                        <p className="text-xs text-espresso/60">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-espresso/70">{p.sku}</td>
                  <td className="px-4 py-3 text-espresso/70">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-espresso">{formatAmd(p.priceAmd)}</span>
                    {p.compareAtPriceAmd && (
                      <span className="ml-1.5 text-xs text-espresso/50 line-through">{formatAmd(p.compareAtPriceAmd)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={boundToggle}>
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          p.inStock ? "bg-sage/15 text-sage-dark" : "bg-terracotta/15 text-terracotta-dark"
                        }`}
                      >
                        {p.inStock ? "In stock" : "Out of stock"}
                      </button>
                    </form>
                    {isLowStock(p) && (
                      <p className="mt-1 text-xs font-semibold text-terracotta-dark">
                        ⚠ Low stock — {p.stockQuantity} left
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <FlagsCell
                      productId={p.id}
                      featured={p.featured}
                      bestseller={p.bestseller}
                      newArrival={p.newArrival}
                      pickBy={p.pickBy}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-sm font-semibold text-terracotta-dark hover:underline">
                        Edit
                      </Link>
                      <DeleteButton
                        action={boundDelete}
                        label="Delete"
                        confirmMessage={`Delete "${p.name}"? This can't be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
