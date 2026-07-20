"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import type { Product, AgeRange, CategoryInfo } from "@/types";
import { ageRangeLabel } from "@/lib/format";
import { ProductCard } from "@/components/shop/ProductCard";
import { QuickViewModal } from "@/components/shop/QuickViewModal";
import { PriceRangeFilter } from "@/components/shop/PriceRangeFilter";
import { useTranslations, useI18n } from "@/lib/i18n/context";
import { localizeCategories, localizeCategory } from "@/lib/i18n/localize-data";

type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";

const PRICE_MIN = 0;
const PRICE_MAX = 200000;

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ShopCatalog({
  products,
  category,
  materials,
  brands,
}: {
  products: Product[];
  category?: CategoryInfo;
  materials: string[];
  brands: string[];
}) {
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [ageRanges, setAgeRanges] = useState<AgeRange[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPicks, setSelectedPicks] = useState<("max" | "lizzy")[]>([]);
  const [sort, setSort] = useState<SortKey>("featured");
  const [search, setSearch] = useState("");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
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
      result = result.filter((p) => p.materials.some((m) => selectedMaterials.includes(m)));
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
                className="h-4 w-4 rounded border-tan text-terracotta focus-visible:outline-terracotta"
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
              className="h-4 w-4 rounded border-tan text-terracotta focus-visible:outline-terracotta"
            />
            {t.badges.maxPick}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedPicks.includes("lizzy")}
              onChange={() => setSelectedPicks((prev) => toggle(prev, "lizzy"))}
              className="h-4 w-4 rounded border-tan text-terracotta focus-visible:outline-terracotta"
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
        <div className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
          {materials.map((material) => (
            <label key={material} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedMaterials.includes(material)}
                onChange={() => setSelectedMaterials((prev) => toggle(prev, material))}
                className="h-4 w-4 rounded border-tan text-terracotta focus-visible:outline-terracotta"
              />
              {material}
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
                className="h-4 w-4 rounded border-tan text-terracotta focus-visible:outline-terracotta"
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
          <label className="flex items-center gap-2 text-sm">
            <span className="sr-only">{t.shop.sortAria}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-tan bg-white px-3 py-2 text-sm focus:outline-none"
            >
              <option value="featured">{t.shop.sortFeatured}</option>
              <option value="price-asc">{t.shop.sortPriceAsc}</option>
              <option value="price-desc">{t.shop.sortPriceDesc}</option>
              <option value="name-asc">{t.shop.sortNameAsc}</option>
            </select>
          </label>
        </div>

        {filtersOpen && <div className="mt-4 lg:hidden">{filterPanel}</div>}

        <p className="mt-4 text-sm text-espresso/70" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? t.shop.productSingular : t.shop.productPlural}
        </p>

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-espresso/70">
            {t.shop.noResults}
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.slug} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
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
