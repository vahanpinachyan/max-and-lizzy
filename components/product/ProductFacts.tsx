import type { Product } from "@/types";
import { ageRangeLabel, materialLabel } from "@/lib/format";
import { getServerDictionary } from "@/lib/i18n/server";

export async function ProductFacts({ product }: { product: Product }) {
  const { dict: t, locale } = await getServerDictionary();
  return (
    <dl className="grid grid-cols-1 gap-4 rounded-3xl border border-tan/50 bg-white p-5 sm:grid-cols-2">
      <div>
        <dt className="text-xs font-bold uppercase tracking-wide text-espresso/70">{t.product.ageRangeLabel}</dt>
        <dd className="mt-1 text-espresso">{ageRangeLabel(product.ageRange, locale)}</dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-wide text-espresso/70">{t.product.brand}</dt>
        <dd className="mt-1 text-espresso">{product.brand}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-xs font-bold uppercase tracking-wide text-espresso/70">{t.product.materials}</dt>
        <dd className="mt-1 text-espresso">{product.materials.map((m) => materialLabel(m, locale)).join(", ")}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-xs font-bold uppercase tracking-wide text-espresso/70">{t.product.safety}</dt>
        <dd className="mt-1">
          <ul className="space-y-1 text-espresso">
            {product.safetyInfo.map((info) => (
              <li key={info} className="flex items-start gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-sage-dark)"
                  className="mt-1 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {info}
              </li>
            ))}
          </ul>
        </dd>
      </div>
      {product.dimensions && (
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-espresso/70">{t.product.dimensions}</dt>
          <dd className="mt-1 text-espresso">{product.dimensions}</dd>
        </div>
      )}
      {product.weightGrams && (
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-espresso/70">{t.product.weight}</dt>
          <dd className="mt-1 text-espresso">
            {product.weightGrams >= 1000 ? `${(product.weightGrams / 1000).toFixed(1)} kg` : `${product.weightGrams} g`}
          </dd>
        </div>
      )}
      {product.countryOfOrigin && (
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-espresso/70">{t.product.countryOfOrigin}</dt>
          <dd className="mt-1 text-espresso">{product.countryOfOrigin}</dd>
        </div>
      )}
      {product.careInstructions && (
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-espresso/70">{t.product.care}</dt>
          <dd className="mt-1 text-espresso">{product.careInstructions}</dd>
        </div>
      )}
      {product.packageContents && (
        <div className="sm:col-span-2">
          <dt className="text-xs font-bold uppercase tracking-wide text-espresso/70">{t.product.packageContents}</dt>
          <dd className="mt-1 text-espresso">{product.packageContents}</dd>
        </div>
      )}
      {product.assemblyRequired !== undefined && (
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-espresso/70">{t.product.assembly}</dt>
          <dd className="mt-1 text-espresso">
            {product.assemblyRequired ? product.assemblyNote || t.product.assemblyRequired : t.product.assemblyNotRequired}
          </dd>
        </div>
      )}
      {product.supervisionNote && (
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-espresso/70">{t.product.supervision}</dt>
          <dd className="mt-1 text-espresso">{product.supervisionNote}</dd>
        </div>
      )}
      {product.warranty && (
        <div className="sm:col-span-2">
          <dt className="text-xs font-bold uppercase tracking-wide text-espresso/70">{t.product.warranty}</dt>
          <dd className="mt-1 text-espresso">{product.warranty}</dd>
        </div>
      )}
    </dl>
  );
}
