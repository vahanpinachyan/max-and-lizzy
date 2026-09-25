"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import type { Product, AgeRange, CategoryInfo } from "@/types";
import { ageRangeLabel, materialLabel } from "@/lib/format";
import { productMaterialGroups } from "@/lib/materials";
import { ProductCard } from "@/components/shop/ProductCard";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { PriceRangeFilter } from "@/components/shop/PriceRangeFilter";
import { Select } from "@/components/ui/Select";
import { useTranslations, useI18n } from "@/lib/i18n/context";
import { localizeCategories, localizeCategory } from "@/lib/i18n/localize-data";

type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";

const PRICE_MIN = 0;
const PRICE_MAX = 200000;
// Divisible by the 2 / 3 / 4 column grid, so the last row is never ragged.
const PAGE_SIZE = 24;

// Page numbers to render: always the first and last, plus a window around the
// current one, with gaps collapsed to an ellipsis. Returns e.g. [1,"…",6,7,8,"…",30].
function pageItems(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => pages.add(n));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => pages.add(n));
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ShopCatalog({
  products,
  category,
  materials,
  brands,
  initialSubcategory,
}: {
  products: Product[];
  category?: CategoryInfo;
  materials: string[];
  brands: string[];
  initialSubcategory?: string;
}) {
  const [subcategory, setSubcategory] = useState<string | null>(initialSubcategory ?? null);
  const [ageRanges, setAgeRanges] = useState<AgeRange[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPicks, setSelectedPicks] = useState<("max" | "lizzy")[]>([]);
  const [sort, setSort] = useState<SortKey>("featured");
  const [search, setSearch] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);
  // Set once the user actually changes pages, so the first paint doesn't
  // scroll and deep-linking straight into the grid still lands naturally.
  const hasPagedRef = useRef(false);
  const t = useTranslations();
  const { locale } = useI18n();
  const localizedCategory = category ? localizeCategory(category, locale) : undefined;
  const allCategories = localizeCategories(locale);

  const availableAgeRanges = useMemo(
    () => Array.from(new Set(products.map((p) => p.ageRange))) as AgeRange[],
    [products]
  );

  const filtered = useMemo(() => {
    let result = products;

    if (subcategory) result = result.filter((p) => p.subcategory === subcategory);
    if (ageRanges.length) result = result.filter((p) => ageRanges.includes(p.ageRange));
    if (priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX) {
      result = result.filter((p) => p.priceAmd >= priceRange[0] && p.priceAmd <= priceRange[1]);
    }
    if (selectedMaterials.length) {
      // Match on the filter group, not the raw string — the facet lists groups.
      result = result.filter((p) =>
        productMaterialGroups(p.materials).some((g) => selectedMaterials.includes(g))
      );
    }
    if (selectedBrands.length) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }
    if (selectedPicks.length) {
      result = result.filter((p) => p.pickBy && selectedPicks.includes(p.pickBy));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.materials.some((m) => m.toLowerCase().includes(q))
      );
    }

    const sorted = [...result];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.priceAmd - b.priceAmd);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.priceAmd - a.priceAmd);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
    }
    return sorted;
  }, [products, subcategory, ageRanges, priceRange, selectedMaterials, selectedBrands, selectedPicks, search, sort]);

  // Any change to the result set puts the user back on page 1 — staying on
  // page 7 of a freshly filtered list is disorienting. Adjusted during render
  // off the memo's identity (which already tracks exactly the filter, sort and
  // search inputs) rather than in an effect, which would render the stale page
  // first and then immediately re-render. This is React's documented pattern
  // for adjusting state when inputs change.
  const [lastFiltered, setLastFiltered] = useState(filtered);
  let pendingPage = page;
  if (lastFiltered !== filtered) {
    setLastFiltered(filtered);
    setPage(1);
    pendingPage = 1;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp rather than trust state: a filter that shrinks the result set can
  // leave `page` past the end, which would otherwise render an empty grid.
  const currentPage = Math.min(pendingPage, totalPages);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  useEffect(() => {
    if (!hasPagedRef.current) return;
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  function goToPage(next: number) {
    hasPagedRef.current = true;
    setPage(Math.min(Math.max(1, next), totalPages));
  }

  const priceIsActive = priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX;
  const activeFilterCount =
    (subcategory ? 1 : 0) +
    ageRanges.length +
    (priceIsActive ? 1 : 0) +
    selectedMaterials.length +
    selectedBrands.length +
    selectedPicks.length;

  function clearFilters() {
    setSubcategory(null);
    setAgeRanges([]);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setSelectedMaterials([]);
    setSelectedBrands([]);
    setSelectedPicks([]);
    setSearch("");
  }

  const filterPanel = (
    <div className="space-y-8">
      {!category && (
        <div>
          <h3 className="font-semibold text-espresso">{t.shop.category}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {allCategories.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/shop/${cat.slug}`} className="text-espresso/80 hover:text-terracotta-dark">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {localizedCategory && (
        <div>
          <h3 className="font-semibold text-espresso">{t.shop.subcategory}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <button
                className={`hover:text-terracotta-dark ${!subcategory ? "font-semibold text-terracotta-dark" : "text-espresso/80"}`}
                onClick={() => setSubcategory(null)}
              >
                {t.shop.allOf} {localizedCategory.name}
              </button>
            </li>
            {localizedCategory.subcategories.map((sub) => (
              <li key={sub.slug}>
                <button
                  className={`hover:text-terracotta-dark ${subcategory === sub.slug ? "font-semibold text-terracotta-dark" : "text-espresso/80"}`}
                  onClick={() => setSubcategory(sub.slug)}
                >
                  {sub.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset>
        <legend className="font-semibold text-espresso">{t.shop.ageRange}</legend>
        <div className="mt-3 space-y-2 text-sm">
          {availableAgeRanges.map((range) => (
            <label key={range} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ageRanges.includes(range)}
                onChange={() => setAgeRanges((prev) => toggle(prev, range))}
                className="form-checkbox"
              />
              {ageRangeLabel(range, locale)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold text-espresso">{t.shop.pickedBy}</legend>
        <div className="mt-3 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedPicks.includes("max")}
              onChange={() => setSelectedPicks((prev) => toggle(prev, "max"))}
              className="form-checkbox"
            />
            {t.badges.maxPick}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedPicks.includes("lizzy")}
              onChange={() => setSelectedPicks((prev) => toggle(prev, "lizzy"))}
              className="form-checkbox"
            />
            {t.badges.lizzyPick}
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold text-espresso">{t.shop.price}</legend>
        <div className="mt-3">
          <PriceRangeFilter
            min={priceRange[0]}
            max={priceRange[1]}
            onApply={(min, max) => setPriceRange([min, max])}
            applyLabel={t.shop.applyPrice}
            minAriaLabel={t.shop.minPriceAria}
            maxAriaLabel={t.shop.maxPriceAria}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold text-espresso">{t.shop.material}</legend>
        <div className="scrollbar-thin mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
          {materials.map((material) => (
            <label key={material} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMaterials.includes(material)}
                onChange={() => setSelectedMaterials((prev) => toggle(prev, material))}
                className="form-checkbox"
              />
              {materialLabel(material, locale)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold text-espresso">{t.shop.brand}</legend>
        <div className="mt-3 space-y-2 text-sm">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => setSelectedBrands((prev) => toggle(prev, brand))}
                className="form-checkbox"
              />
              {brand}
            </label>
          ))}
        </div>
      </fieldset>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="text-sm font-semibold text-terracotta-dark hover:underline">
          {t.shop.clearFilters}
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block" aria-label={t.shop.filtersAria}>
        {filterPanel}
      </aside>

      <div>
        <div className="flex flex-wrap items-center gap-3 border-b border-tan/50 pb-4">
          <label className="relative flex-1 min-w-[200px]">
            <span className="sr-only">{t.nav.search}</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.shop.searchPlaceholder}
              className="w-full rounded-full border border-tan bg-white px-4 py-2 text-sm focus:outline-none"
            />
          </label>
          <button
            className="lg:hidden rounded-full border border-tan px-4 py-2 text-sm font-semibold text-espresso"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            {t.shop.filters}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          <div className="w-48 shrink-0">
            <label htmlFor="shop-sort" className="sr-only">{t.shop.sortAria}</label>
            <Select
              id="shop-sort"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              placeholder={t.shop.sortFeatured}
              options={[
                { value: "featured", label: t.shop.sortFeatured },
                { value: "price-asc", label: t.shop.sortPriceAsc },
                { value: "price-desc", label: t.shop.sortPriceDesc },
                { value: "name-asc", label: t.shop.sortNameAsc },
              ]}
            />
          </div>
        </div>

        {filtersOpen && <div className="mt-4 lg:hidden">{filterPanel}</div>}

        <p className="mt-4 text-sm text-espresso/70" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? t.shop.productSingular : t.shop.productPlural}
          {totalPages > 1 && (
            <span className="ml-2 text-espresso/50">
              {t.shop.pageOf.replace("{current}", String(currentPage)).replace("{total}", String(totalPages))}
            </span>
          )}
        </p>

        <div ref={gridTopRef} className="scroll-mt-28" />

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-espresso/70">
            {t.shop.noResults}
          </p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {paginated.map((product) => (
                <ProductCard key={product.slug} product={product} onQuickView={setQuickViewProduct} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-10 flex flex-wrap items-center justify-center gap-2"
                aria-label={t.shop.paginationLabel}
              >
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-full border border-tan/70 px-4 py-2 text-sm font-medium text-espresso transition hover:bg-tan/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  {t.shop.previousPage}
                </button>

                {pageItems(currentPage, totalPages).map((item, i) =>
                  item === "gap" ? (
                    <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-espresso/40">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => goToPage(item)}
                      aria-current={item === currentPage ? "page" : undefined}
                      aria-label={t.shop.goToPage.replace("{page}", String(item))}
                      className={
                        item === currentPage
                          ? "min-w-10 rounded-full bg-espresso px-3 py-2 text-sm font-bold text-cream"
                          : "min-w-10 rounded-full border border-tan/70 px-3 py-2 text-sm font-medium text-espresso transition hover:bg-tan/30"
                      }
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-tan/70 px-4 py-2 text-sm font-medium text-espresso transition hover:bg-tan/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  {t.shop.nextPage}
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            key={quickViewProduct.slug}
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
