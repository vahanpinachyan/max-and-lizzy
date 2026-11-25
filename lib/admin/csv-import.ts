// Column semantics for the /admin product CSV importer.
//
// The importer shares buildProductData with the admin product form, and that
// function always returns every column — correct for the form, which submits
// the whole product every time. For a spreadsheet it is wrong: a CSV with a
// handful of columns would write defaults over everything it did not mention,
// so re-uploading a price list reset priceAmd to 0, blanked category, dropped
// curated relatedSlugs, and restocked the whole catalogue.
//
// The rule here is: a column the spreadsheet did not supply is not written at
// all. On an update the stored value survives; on a create the Prisma schema
// default applies (inStock defaults to true, the other flags to false), which
// is what a brand-new product should get.

export type CsvRecord = Record<string, string | null | undefined>;

export const CSV_TRUE_VALUES = new Set(["true", "1", "yes", "y", "in stock", "on"]);

// Columns parsed as booleans. Everything else is passed through as text and
// coerced by buildProductData.
export const CSV_BOOL_COLUMNS = [
  "inStock",
  "featured",
  "bestseller",
  "newArrival",
  "onSale",
  "assemblyRequired",
] as const;

// Fields Prisma cannot default: a create must carry them even when the CSV is
// silent, so the row gets buildProductData's fallback ("" / 0 / "0-3" / "[]")
// rather than failing the insert. Mirrors the non-null, no-default columns of
// model Product.
export const CSV_REQUIRED_ON_CREATE = [
  "slug",
  "sku",
  "name",
  "shortDescription",
  "description",
  "priceAmd",
  "category",
  "subcategory",
  "ageRange",
  "brand",
  "materials",
  "safetyInfo",
  "images",
] as const;

// Data keys assembled from differently-named CSV headers. Anything absent here
// is matched against a header of its own name.
const COLUMN_SOURCES: Record<string, readonly string[]> = {
  images: ["images", "imageSrcs", "imageAlts"],
};

/**
 * "true" / "false" for a recognised value, or undefined for a blank cell —
 * undefined meaning "the spreadsheet did not say", which leaves the stored
 * value alone. Anything unrecognised reads as false, matching the old
 * importer.
 */
export function csvBool(raw: string | null | undefined): string | undefined {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s) return undefined;
  return CSV_TRUE_VALUES.has(s) ? "true" : "false";
}

/**
 * Turn one parsed CSV row into a record for buildProductData, alongside the
 * set of headers that actually carried a value. A header that is missing, or
 * present with a blank cell, is reported as not supplied.
 */
export function csvRowToRecord(
  headers: string[],
  rawRow: string[],
): { record: CsvRecord; supplied: Set<string> } {
  const record: CsvRecord = {};
  const supplied = new Set<string>();

  headers.forEach((header, idx) => {
    const cell = rawRow[idx] ?? "";
    record[header] = cell;
    if (cell.trim()) supplied.add(header);
  });

  for (const col of CSV_BOOL_COLUMNS) {
    const parsed = csvBool(record[col]);
    if (parsed === undefined) delete record[col];
    else record[col] = parsed;
  }

  return { record, supplied };
}

function isSupplied(key: string, supplied: Set<string>): boolean {
  return (COLUMN_SOURCES[key] ?? [key]).some((col) => supplied.has(col));
}

/**
 * Narrow a full buildProductData object to just the columns this CSV supplied.
 * Used for updates, so untouched fields keep their stored values.
 */
export function csvUpdateData<T extends Record<string, unknown>>(
  data: T,
  supplied: Set<string>,
): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(data) as (keyof T & string)[]) {
    if (isSupplied(key, supplied)) out[key] = data[key];
  }
  return out;
}

/**
 * As csvUpdateData, plus the columns Prisma cannot default. Used for creates.
 * Omitting the rest lets the schema defaults apply.
 */
export function csvCreateData<T extends Record<string, unknown>>(
  data: T,
  supplied: Set<string>,
): Partial<T> {
  const out = csvUpdateData(data, supplied);
  for (const key of CSV_REQUIRED_ON_CREATE) {
    if (!(key in out) && key in data) out[key as keyof T & string] = data[key as keyof T & string];
  }
  return out;
}

/**
 * True when an update would write nothing but the slug it matched on, i.e. the
 * row named a product but supplied no other column.
 */
export function isEmptyUpdate(patch: Record<string, unknown>): boolean {
  return Object.keys(patch).every((key) => key === "slug");
}
