"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { categories } from "@/data/categories";
import { autoTranslateProduct } from "@/app/admin/(protected)/products/actions";

export interface ProductFormInitial {
  slug: string;
  sku: string;
  name: string;
  nameHy: string;
  nameRu: string;
  shortDescription: string;
  shortDescriptionHy: string;
  shortDescriptionRu: string;
  description: string;
  descriptionHy: string;
  descriptionRu: string;
  priceAmd: number;
  compareAtPriceAmd: number | "";
  category: string;
  subcategory: string;
  ageRange: string;
  brand: string;
  materials: string;
  safetyInfo: string;
  imageSrcs: string;
  imageAlts: string;
  inStock: boolean;
  stockQuantity: number | "";
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  dimensions: string;
  weightGrams: number | "";
  careInstructions: string;
}

export const emptyProduct: ProductFormInitial = {
  slug: "",
  sku: "",
  name: "",
  nameHy: "",
  nameRu: "",
  shortDescription: "",
  shortDescriptionHy: "",
  shortDescriptionRu: "",
  description: "",
  descriptionHy: "",
  descriptionRu: "",
  priceAmd: 0,
  compareAtPriceAmd: "",
  category: categories[0]?.slug ?? "",
  subcategory: categories[0]?.subcategories[0]?.slug ?? "",
  ageRange: "0-3",
  brand: "",
  materials: "",
  safetyInfo:
    "Tested to ASTM F963 & EN71 safety standards\nNon-toxic, water-based paints and finishes\nNo small parts hazard for stated age range",
  imageSrcs: "",
  imageAlts: "",
  inStock: true,
  stockQuantity: "",
  featured: false,
  bestseller: false,
  newArrival: false,
  dimensions: "",
  weightGrams: "",
  careInstructions: "",
};

type ActionFn = (prevState: { error: string | null }, formData: FormData) => Promise<{ error: string | null }>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-espresso">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass = "w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm focus:outline-none";

export function ProductForm({
  action,
  initial,
  mode,
}: {
  action: ActionFn;
  initial: ProductFormInitial;
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const [categorySlug, setCategorySlug] = useState(initial.category);
  const selectedCategory = categories.find((c) => c.slug === categorySlug) ?? categories[0];

  const nameRef = useRef<HTMLInputElement>(null);
  const nameHyRef = useRef<HTMLInputElement>(null);
  const nameRuRef = useRef<HTMLInputElement>(null);
  const shortDescRef = useRef<HTMLTextAreaElement>(null);
  const shortDescHyRef = useRef<HTMLTextAreaElement>(null);
  const shortDescRuRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const descHyRef = useRef<HTMLTextAreaElement>(null);
  const descRuRef = useRef<HTMLTextAreaElement>(null);
  const [translating, startTranslating] = useTransition();
  const [translateError, setTranslateError] = useState<string | null>(null);

  function handleAutoTranslate() {
    setTranslateError(null);
    const name = nameRef.current?.value.trim() ?? "";
    const shortDescription = shortDescRef.current?.value.trim() ?? "";
    const description = descRef.current?.value.trim() ?? "";
    if (!name && !shortDescription && !description) {
      setTranslateError("Fill in the English name/description first.");
      return;
    }
    startTranslating(async () => {
      const result = await autoTranslateProduct({ name, shortDescription, description });
      if (result.error || !result.hy || !result.ru) {
        setTranslateError(result.error ?? "Translation failed.");
        return;
      }
      if (nameHyRef.current) nameHyRef.current.value = result.hy.name;
      if (nameRuRef.current) nameRuRef.current.value = result.ru.name;
      if (shortDescHyRef.current) shortDescHyRef.current.value = result.hy.shortDescription;
      if (shortDescRuRef.current) shortDescRuRef.current.value = result.ru.shortDescription;
      if (descHyRef.current) descHyRef.current.value = result.hy.description;
      if (descRuRef.current) descRuRef.current.value = result.ru.description;
    });
  }

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      {state.error && (
        <p className="rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta-dark" role="alert">
          {state.error}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="font-semibold text-espresso">Basics</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Slug (URL, unique)">
            <input name="slug" defaultValue={initial.slug} required disabled={mode === "edit"} className={`${inputClass} disabled:bg-beige disabled:text-espresso/60`} />
          </Field>
          <Field label="SKU">
            <input name="sku" defaultValue={initial.sku} required className={inputClass} />
          </Field>
        </div>
        <Field label="Name (English)">
          <input ref={nameRef} name="name" defaultValue={initial.name} required className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name (Armenian) — optional, falls back to English">
            <input ref={nameHyRef} name="nameHy" defaultValue={initial.nameHy} className={inputClass} />
          </Field>
          <Field label="Name (Russian) — optional, falls back to English">
            <input ref={nameRuRef} name="nameRu" defaultValue={initial.nameRu} className={inputClass} />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-espresso">Descriptions</h2>
          <div>
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={translating}
              className="rounded-full border border-wood/40 bg-wood/10 px-4 py-1.5 text-xs font-semibold text-wood-dark hover:bg-wood/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {translating ? "Translating…" : "✨ Auto-translate Armenian & Russian from English"}
            </button>
            {translateError && <p className="mt-1.5 max-w-xs text-right text-xs text-terracotta-dark">{translateError}</p>}
          </div>
        </div>
        <Field label="Short description (English)">
          <textarea ref={shortDescRef} name="shortDescription" defaultValue={initial.shortDescription} required rows={2} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Short description (Armenian)">
            <textarea ref={shortDescHyRef} name="shortDescriptionHy" defaultValue={initial.shortDescriptionHy} rows={2} className={inputClass} />
          </Field>
          <Field label="Short description (Russian)">
            <textarea ref={shortDescRuRef} name="shortDescriptionRu" defaultValue={initial.shortDescriptionRu} rows={2} className={inputClass} />
          </Field>
        </div>
        <Field label="Full description (English)">
          <textarea ref={descRef} name="description" defaultValue={initial.description} required rows={4} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full description (Armenian)">
            <textarea ref={descHyRef} name="descriptionHy" defaultValue={initial.descriptionHy} rows={4} className={inputClass} />
          </Field>
          <Field label="Full description (Russian)">
            <textarea ref={descRuRef} name="descriptionRu" defaultValue={initial.descriptionRu} rows={4} className={inputClass} />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-espresso">Pricing &amp; stock</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (AMD)">
            <input name="priceAmd" type="number" min={0} defaultValue={initial.priceAmd} required className={inputClass} />
          </Field>
          <Field label="Compare-at price (AMD) — shows a sale badge if set">
            <input name="compareAtPriceAmd" type="number" min={0} defaultValue={initial.compareAtPriceAmd} className={inputClass} />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-espresso">
            <input type="checkbox" name="inStock" defaultChecked={initial.inStock} className="h-4 w-4 rounded border-tan text-terracotta" />
            In stock
          </label>
          <Field label="Stock quantity (optional — just for your own tracking)">
            <input name="stockQuantity" type="number" min={0} defaultValue={initial.stockQuantity} className={inputClass} />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-espresso">Categorization</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select
              name="category"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Subcategory">
            <select
              name="subcategory"
              key={categorySlug}
              defaultValue={categorySlug === initial.category ? initial.subcategory : selectedCategory?.subcategories[0]?.slug}
              className={inputClass}
            >
              {selectedCategory?.subcategories.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Age range">
            <select name="ageRange" defaultValue={initial.ageRange} className={inputClass}>
              <option value="0-3">0–3 years</option>
              <option value="3-6">3–6 years</option>
              <option value="6-12">6–12 years</option>
            </select>
          </Field>
          <Field label="Brand">
            <input name="brand" defaultValue={initial.brand} required className={inputClass} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-espresso">
            <input type="checkbox" name="featured" defaultChecked={initial.featured} className="h-4 w-4 rounded border-tan text-terracotta" />
            Featured (shows on homepage)
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-espresso">
            <input type="checkbox" name="bestseller" defaultChecked={initial.bestseller} className="h-4 w-4 rounded border-tan text-terracotta" />
            Bestseller badge
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-espresso">
            <input type="checkbox" name="newArrival" defaultChecked={initial.newArrival} className="h-4 w-4 rounded border-tan text-terracotta" />
            New badge
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-espresso">Images</h2>
        <p className="text-xs text-espresso/60">
          One image URL per line in the first box, matching alt text (one line per image) in the second. Upload photos
          somewhere first (e.g. your host&apos;s file storage) and paste the URLs here — there&apos;s no upload button yet.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Image URLs (one per line)">
            <textarea name="imageSrcs" defaultValue={initial.imageSrcs} rows={3} className={inputClass} placeholder="/images/products/example-1.jpg" />
          </Field>
          <Field label="Alt text (one per line, matching order)">
            <textarea name="imageAlts" defaultValue={initial.imageAlts} rows={3} className={inputClass} placeholder="Wooden toy on a white background" />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-espresso">Materials &amp; safety</h2>
        <Field label="Materials (one per line)">
          <textarea name="materials" defaultValue={initial.materials} rows={3} className={inputClass} />
        </Field>
        <Field label="Safety &amp; certification notes (one per line)">
          <textarea name="safetyInfo" defaultValue={initial.safetyInfo} rows={3} className={inputClass} />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-espresso">Extra details (optional)</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Dimensions">
            <input name="dimensions" defaultValue={initial.dimensions} className={inputClass} />
          </Field>
          <Field label="Weight (grams)">
            <input name="weightGrams" type="number" min={0} defaultValue={initial.weightGrams} className={inputClass} />
          </Field>
        </div>
        <Field label="Care instructions">
          <input name="careInstructions" defaultValue={initial.careInstructions} className={inputClass} />
        </Field>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-wood px-8 py-3 font-semibold text-white transition-colors hover:bg-wood-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
      </button>
    </form>
  );
}
