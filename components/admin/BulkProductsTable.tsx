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
import { filterProducts } from "@/lib/admin/product-search";
import type { AdminDictionary } from "@/lib/admin/i18n";
import { interpolate } from "@/lib/i18n/interpolate";

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
  onSale: boolean;
  pickBy: string | null;
  image: string | null;
};

// The table used to render every product at once. At 705 rows that is ~24,000
// DOM nodes, and because selection and search live in React state, any state
// change re-rendered all of them: ~85ms to tick one checkbox, ~145ms per
// keystroke when clearing the search back to the full list. Paginating the
// *rendering* fixes that without touching the bulk workflow, which still
// operates on everything the search matches.
const PAGE_SIZE = 50;

const FLAG_KEYS: (keyof BulkFlagUpdates)[] = ["featured", "bestseller", "newArrival", "onSale"];

function flagLabel(t: AdminDictionary["productsList"], key: keyof BulkFlagUpdates): string {
  if (key === "featured") return t.flagFeatured;
  if (key === "bestseller") return t.flagBestseller;
  if (key === "newArrival") return t.flagNew;
  return t.flagSale;
}

export function BulkProductsTable({
  products,
  t,
}: {
  products: ProductRow[];
  t: AdminDictionary["productsList"];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [priceMode, setPriceMode] = useState<"set" | "adjustPercent" | "startSale">("set");
  const [priceValue, setPriceValue] = useState("");
  const [flagAction, setFlagAction] = useState<"add" | "remove">("add");
  const [flagKey, setFlagKey] = useState<keyof BulkFlagUpdates>("featured");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [salePercent, setSalePercent] = useState("");
  const [saleStartsOn, setSaleStartsOn] = useState("");
  const [saleEndsOn, setSaleEndsOn] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  // Matching rules live in lib/admin/product-search.ts so they are unit-tested
  // without rendering this table.
  const visible = useMemo(() => filterProducts(products, query), [products, query]);

  // Reset to page 1 when the filtered set changes, adjusting during render off
  // the memo's identity rather than in an effect — same pattern as the
  // storefront catalogue, and react-hooks/set-state-in-effect enforces it.
  const [page, setPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(visible);
  let pendingPage = page;
  if (lastVisible !== visible) {
    setLastVisible(visible);
    setPage(1);
    pendingPage = 1;
  }
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(pendingPage, totalPages);
  const pageRows = useMemo(
    () => visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [visible, currentPage],
  );

  // Bulk actions change prices, so a selection must never include rows the
  // search has hidden — a staff member cannot see what they would be editing.
  // Changing the query clears the selection rather than carrying it invisibly.
  function updateQuery(next: string) {
    setQuery(next);
    setSelected(new Set());
  }

  // The header checkbox covers the rows actually on screen. Selecting rows a
  // staff member cannot see is how a bulk price change goes wrong, so reaching
  // past this page is a separate, explicit click (see selectAllMatching).
  const pageAllSelected = pageRows.length > 0 && pageRows.every((p) => selected.has(p.id));
  const allMatchingSelected = visible.length > 0 && visible.every((p) => selected.has(p.id));
  const moreBeyondPage = visible.length > pageRows.length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const everyOnPageSelected = pageRows.length > 0 && pageRows.every((p) => prev.has(p.id));
      const next = new Set(prev);
      for (const p of pageRows) {
        if (everyOnPageSelected) next.delete(p.id);
        else next.add(p.id);
      }
      return next;
    });
  }

  function selectAllMatching() {
    setSelected(new Set(visible.map((p) => p.id)));
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

  // Restores each selected product's pre-sale price from compareAtPriceAmd.
  // Takes no percentage, so it sits outside the price-mode dropdown.
  function endSale() {
    setError(null);
    startTransition(async () => {
      const result = await bulkUpdateProducts({ ids: selectedIds, priceMode: "endSale" });
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  // Schedules a dated sale. Unlike "Start sale" this writes no prices at all —
  // the discount is applied when products are read, so it switches itself on
  // and off at the dates and leaves the regular price untouched throughout.
  function scheduleSale() {
    setError(null);
    const percent = Number(salePercent);
    if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
      setError("Enter a discount between 1 and 99 percent.");
      return;
    }
    if (!saleStartsOn || !saleEndsOn) {
      setError("Pick a start and an end date.");
      return;
    }
    startTransition(async () => {
      const result = await bulkUpdateProducts({
        ids: selectedIds,
        priceMode: "scheduleSale",
        priceValue: percent,
        saleStartsOn,
        saleEndsOn,
      });
      if (result.error) setError(result.error);
      else {
        setSalePercent("");
        setSaleStartsOn("");
        setSaleEndsOn("");
        router.refresh();
      }
    });
  }

  function cancelScheduledSale() {
    setError(null);
    startTransition(async () => {
      const result = await bulkUpdateProducts({ ids: selectedIds, priceMode: "cancelScheduledSale" });
      if (result.error) setError(result.error);
      else router.refresh();
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
              {interpolate(t.selectedCount, { n: selected.size })}
            </p>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs font-semibold text-espresso/60 hover:text-espresso"
            >
              {t.clearSelection}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-4">
            <div className="flex items-end gap-2">
              <label className="block">
                <span className="block text-xs font-semibold text-espresso">{t.price}</span>
                <select
                  value={priceMode}
                  onChange={(e) => setPriceMode(e.target.value as "set" | "adjustPercent" | "startSale")}
                  className="mt-1 rounded-xl border border-tan bg-white px-2 py-2 text-sm"
                >
                  <option value="set">{t.priceSetTo}</option>
                  <option value="adjustPercent">{t.priceAdjustPercent}</option>
                  <option value="startSale">{t.pricePutOnSale}</option>
                </select>
              </label>
              <input
                type="number"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                placeholder={
                  priceMode === "set" ? "e.g. 12000" : priceMode === "startSale" ? "e.g. 20" : "e.g. -10 or 15"
                }
                className="mt-1 w-36 rounded-xl border border-tan bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={applyPrice}
                disabled={pending || !priceValue}
                className="rounded-full bg-wood px-4 py-2 text-sm font-semibold text-white hover:bg-wood-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {priceMode === "startSale" ? t.startSale : t.applyPrice}
              </button>
              <button
                type="button"
                onClick={endSale}
                disabled={pending}
                className="rounded-full border border-tan bg-white px-4 py-2 text-sm font-semibold text-espresso hover:bg-beige disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t.endSale}
              </button>
            </div>

            <div className="flex items-end gap-2">
              <label className="block">
                <span className="block text-xs font-semibold text-espresso">{t.scheduledSale}</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={salePercent}
                  onChange={(e) => setSalePercent(e.target.value)}
                  placeholder={t.percentOff}
                  aria-label={t.scheduledSale}
                  className="mt-1 w-24 rounded-xl border border-tan bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-espresso">{t.from}</span>
                <input
                  type="date"
                  value={saleStartsOn}
                  onChange={(e) => setSaleStartsOn(e.target.value)}
                  aria-label={t.from}
                  className="mt-1 rounded-xl border border-tan bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-espresso">{t.to}</span>
                <input
                  type="date"
                  value={saleEndsOn}
                  onChange={(e) => setSaleEndsOn(e.target.value)}
                  aria-label={t.to}
                  className="mt-1 rounded-xl border border-tan bg-white px-3 py-2 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={scheduleSale}
                disabled={pending || !salePercent || !saleStartsOn || !saleEndsOn}
                className="rounded-full bg-wood px-4 py-2 text-sm font-semibold text-white hover:bg-wood-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t.schedule}
              </button>
              <button
                type="button"
                onClick={cancelScheduledSale}
                disabled={pending}
                className="rounded-full border border-tan bg-white px-4 py-2 text-sm font-semibold text-espresso hover:bg-beige disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t.cancelScheduled}
              </button>
            </div>

            <div className="flex items-end gap-2">
              <label className="block">
                <span className="block text-xs font-semibold text-espresso">{t.tag}</span>
                <select
                  value={flagAction}
                  onChange={(e) => setFlagAction(e.target.value as "add" | "remove")}
                  className="mt-1 rounded-xl border border-tan bg-white px-2 py-2 text-sm"
                >
                  <option value="add">{t.tagAdd}</option>
                  <option value="remove">{t.tagRemove}</option>
                </select>
              </label>
              <select
                value={flagKey}
                onChange={(e) => setFlagKey(e.target.value as keyof BulkFlagUpdates)}
                className="mt-1 rounded-xl border border-tan bg-white px-2 py-2 text-sm"
              >
                {FLAG_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {flagLabel(t, key)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyFlag}
                disabled={pending}
                className="rounded-full bg-wood px-4 py-2 text-sm font-semibold text-white hover:bg-wood-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t.applyTag}
              </button>
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-terracotta-dark">{error}</p>}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-espresso/40"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchAria}
            className="w-full rounded-xl border border-tan bg-white py-2 pl-9 pr-3 text-sm text-espresso placeholder:text-espresso/40"
          />
        </div>
        {query.trim() && (
          <p className="text-sm text-espresso/70" aria-live="polite">
            {interpolate(t.searchResults, { shown: visible.length, total: products.length })}
            <button
              type="button"
              onClick={() => updateQuery("")}
              className="ml-3 text-xs font-semibold text-espresso/60 underline hover:text-espresso"
            >
              {t.clear}
            </button>
          </p>
        )}
      </div>

      {pageAllSelected && moreBeyondPage && !allMatchingSelected && (
        <div className="mb-3 rounded-xl border border-wood/30 bg-wood/5 px-4 py-2.5 text-sm text-espresso">
          {interpolate(t.pageAllSelected, { n: pageRows.length })}{" "}
          <button
            type="button"
            onClick={selectAllMatching}
            className="font-semibold text-terracotta-dark underline underline-offset-2"
          >
            {interpolate(t.selectAllMatching, { n: visible.length })}
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-tan/50 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-tan/50 bg-beige/50 text-xs font-bold uppercase text-espresso/70">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={pageAllSelected}
                  onChange={toggleAll}
                  aria-label={t.selectAllAria}
                />
              </th>
              <th className="px-4 py-3">{t.colProduct}</th>
              <th className="px-4 py-3">{t.colSku}</th>
              <th className="px-4 py-3">{t.colCategory}</th>
              <th className="px-4 py-3">{t.colPrice}</th>
              <th className="px-4 py-3">{t.colStock}</th>
              <th className="px-4 py-3">{t.colFlags}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tan/30">
            {pageRows.map((p) => {
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
                        {p.inStock ? t.inStock : t.outOfStock}
                      </button>
                    </form>
                    {isLowStock(p) && (
                      <p className="mt-1 text-xs font-semibold text-terracotta-dark">
                        {interpolate(t.lowStockLeft, { n: p.stockQuantity ?? 0 })}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <FlagsCell
                      productId={p.id}
                      featured={p.featured}
                      bestseller={p.bestseller}
                      newArrival={p.newArrival}
                      onSale={p.onSale}
                      pickBy={p.pickBy}
                      t={t}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-sm font-semibold text-terracotta-dark hover:underline">
                        {t.edit}
                      </Link>
                      <DeleteButton
                        action={boundDelete}
                        label={t.deleteLabel}
                        confirmMessage={interpolate(t.deleteConfirm, { name: p.name })}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-espresso/60">
            {interpolate(t.noMatches, { query: query.trim() })}
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-between gap-3" aria-label={t.colProduct}>
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-full border border-tan bg-white px-4 py-2 text-sm font-semibold text-espresso hover:bg-beige disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.previous}
          </button>
          <p className="text-sm text-espresso/70" aria-live="polite">
            {interpolate(t.showingRange, { from: (currentPage - 1) * PAGE_SIZE + 1, to: Math.min(currentPage * PAGE_SIZE, visible.length), total: visible.length })}
            <span className="ml-2 text-espresso/50">{interpolate(t.pageOf, { page: currentPage, total: totalPages })}</span>
          </p>
          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-full border border-tan bg-white px-4 py-2 text-sm font-semibold text-espresso hover:bg-beige disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.next}
          </button>
        </nav>
      )}
    </div>
  );
}
