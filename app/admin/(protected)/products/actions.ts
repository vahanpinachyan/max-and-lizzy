"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireManagerAction } from "@/lib/admin/permissions";
import { translateFields } from "@/lib/translate";
import { parseCsv } from "@/lib/csv";

type Record_ = Record<string, string | null | undefined>;

function linesToArray(input: string | null | undefined): string[] {
  return String(input ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function num(input: string | null | undefined): number | null {
  const s = String(input ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function str(input: string | null | undefined): string | null {
  const s = String(input ?? "").trim();
  return s || null;
}

// Booleans are pre-normalized to the literal strings "true"/"false" by each
// caller (formDataToRecord for the admin form, csvRowToRecord for imports)
// since "absent" means something different in each source — an unchecked
// HTML checkbox vs. a blank spreadsheet cell.
function bool(input: string | null | undefined): boolean {
  return input === "true";
}

function buildProductData(record: Record_) {
  const imageSrcs = linesToArray(record.imageSrcs);
  const imageAlts = linesToArray(record.imageAlts);
  const images = imageSrcs.map((src, i) => ({ src, alt: imageAlts[i] ?? "" }));

  return {
    slug: String(record.slug ?? "").trim(),
    sku: String(record.sku ?? "").trim(),
    name: String(record.name ?? "").trim(),
    nameHy: str(record.nameHy),
    nameRu: str(record.nameRu),
    shortDescription: String(record.shortDescription ?? "").trim(),
    shortDescriptionHy: str(record.shortDescriptionHy),
    shortDescriptionRu: str(record.shortDescriptionRu),
    description: String(record.description ?? "").trim(),
    descriptionHy: str(record.descriptionHy),
    descriptionRu: str(record.descriptionRu),
    priceAmd: num(record.priceAmd) ?? 0,
    compareAtPriceAmd: num(record.compareAtPriceAmd),
    category: String(record.category ?? "").trim(),
    subcategory: String(record.subcategory ?? "").trim(),
    ageRange: String(record.ageRange ?? "0-3").trim(),
    brand: String(record.brand ?? "").trim(),
    materials: JSON.stringify(linesToArray(record.materials)),
    safetyInfo: JSON.stringify(linesToArray(record.safetyInfo)),
    images: JSON.stringify(images),
    relatedSlugs: null,
    inStock: bool(record.inStock),
    stockQuantity: num(record.stockQuantity),
    featured: bool(record.featured),
    bestseller: bool(record.bestseller),
    newArrival: bool(record.newArrival),
    dimensions: str(record.dimensions),
    weightGrams: num(record.weightGrams),
    careInstructions: str(record.careInstructions),
    countryOfOrigin: str(record.countryOfOrigin),
    packageContents: str(record.packageContents),
    assemblyRequired: bool(record.assemblyRequired),
    assemblyNote: str(record.assemblyNote),
    supervisionNote: str(record.supervisionNote),
    warranty: str(record.warranty),
    pickBy: str(record.pickBy),
    pickNote: str(record.pickNote),
    pickNoteHy: str(record.pickNoteHy),
    pickNoteRu: str(record.pickNoteRu),
  };
}

function formDataToRecord(formData: FormData): Record_ {
  const record: Record_ = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") record[key] = value;
  }
  // HTML checkboxes only appear in FormData when checked ("on") — absent
  // means unchecked, not "unspecified", so normalize explicitly.
  record.inStock = formData.get("inStock") === "on" ? "true" : "false";
  record.featured = formData.get("featured") === "on" ? "true" : "false";
  record.bestseller = formData.get("bestseller") === "on" ? "true" : "false";
  record.newArrival = formData.get("newArrival") === "on" ? "true" : "false";
  record.assemblyRequired = formData.get("assemblyRequired") === "on" ? "true" : "false";
  return record;
}

export async function createProduct(_prevState: { error: string | null }, formData: FormData) {
  await requireManagerAction();
  const data = buildProductData(formDataToRecord(formData));
  if (!data.slug || !data.name || !data.sku) {
    return { error: "Slug, name, and SKU are required." };
  }
  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return { error: `A product with slug "${data.slug}" already exists.` };
  }
  await prisma.product.create({ data });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateProduct(id: string, _prevState: { error: string | null }, formData: FormData) {
  await requireManagerAction();
  const data = buildProductData(formDataToRecord(formData));
  if (!data.name || !data.sku) {
    return { error: "Name and SKU are required." };
  }
  await prisma.product.update({ where: { id }, data });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${data.slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireManagerAction();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleStock(id: string, inStock: boolean) {
  await requireManagerAction();
  await prisma.product.update({ where: { id }, data: { inStock } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function setFlag(id: string, flag: "featured" | "bestseller" | "newArrival", value: boolean) {
  await requireManagerAction();
  await prisma.product.update({ where: { id }, data: { [flag]: value } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

// pickBy is a single field ("max" | "lizzy" | null), not an independent
// boolean like the other flags — assigning one character automatically
// clears the other, so there's no separate "unset the other one" step.
export async function setPickBy(id: string, pickBy: "max" | "lizzy" | null) {
  await requireManagerAction();
  await prisma.product.update({ where: { id }, data: { pickBy } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export type BulkFlagUpdates = Partial<Record<"featured" | "bestseller" | "newArrival", boolean>>;

export async function bulkUpdateProducts(input: {
  ids: string[];
  priceMode?: "set" | "adjustPercent";
  priceValue?: number;
  flags?: BulkFlagUpdates;
}): Promise<{ error: string | null }> {
  await requireManagerAction();
  const { ids, priceMode, priceValue, flags } = input;
  if (!ids.length) return { error: "No products selected." };

  const flagData = flags && Object.keys(flags).length ? flags : null;

  if (priceMode === "set") {
    if (typeof priceValue !== "number" || !Number.isFinite(priceValue) || priceValue < 0) {
      return { error: "Enter a valid price." };
    }
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { priceAmd: Math.round(priceValue), ...flagData },
    });
  } else if (priceMode === "adjustPercent") {
    if (typeof priceValue !== "number" || !Number.isFinite(priceValue)) {
      return { error: "Enter a valid percentage." };
    }
    const products = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, priceAmd: true } });
    await prisma.$transaction(
      products.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data: { priceAmd: Math.max(0, Math.round(p.priceAmd * (1 + priceValue / 100))), ...flagData },
        })
      )
    );
  } else if (flagData) {
    await prisma.product.updateMany({ where: { id: { in: ids } }, data: flagData });
  } else {
    return { error: "Choose a price change or a tag to apply." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { error: null };
}

export type AutoTranslateResult = {
  error: string | null;
  hy: { name: string; shortDescription: string; description: string } | null;
  ru: { name: string; shortDescription: string; description: string } | null;
};

export async function autoTranslateProduct(input: {
  name: string;
  shortDescription: string;
  description: string;
}): Promise<AutoTranslateResult> {
  await requireManagerAction();

  const fields = { name: input.name, shortDescription: input.shortDescription, description: input.description };
  const [hy, ru] = await Promise.all([translateFields(fields, "hy"), translateFields(fields, "ru")]);

  if (!hy || !ru) {
    return {
      error: "Auto-translate isn't set up yet — add GOOGLE_TRANSLATE_API_KEY to your environment (see README).",
      hy: null,
      ru: null,
    };
  }

  return {
    error: null,
    hy: { name: hy.name, shortDescription: hy.shortDescription, description: hy.description },
    ru: { name: ru.name, shortDescription: ru.shortDescription, description: ru.description },
  };
}

const CSV_TRUE_VALUES = new Set(["true", "1", "yes", "y", "in stock", "on"]);

function csvBool(raw: string | undefined, defaultValue: boolean): string {
  const s = (raw ?? "").trim().toLowerCase();
  if (!s) return defaultValue ? "true" : "false";
  return CSV_TRUE_VALUES.has(s) ? "true" : "false";
}

export type CsvImportResult = {
  error: string | null;
  created: number;
  updated: number;
  skipped: { row: number; reason: string }[];
};

export async function importProductsFromCsv(formData: FormData): Promise<CsvImportResult> {
  await requireManagerAction();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file to upload.", created: 0, updated: 0, skipped: [] };
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { error: "The file has no data rows.", created: 0, updated: 0, skipped: [] };
  }

  const headers = rows[0].map((h) => h.trim());
  let created = 0;
  let updated = 0;
  const skipped: { row: number; reason: string }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const rawRow = rows[i];
    if (rawRow.every((cell) => !cell.trim())) continue;

    const record: Record_ = {};
    headers.forEach((h, idx) => {
      record[h] = rawRow[idx] ?? "";
    });
    record.inStock = csvBool(record.inStock ?? undefined, true);
    record.featured = csvBool(record.featured ?? undefined, false);
    record.bestseller = csvBool(record.bestseller ?? undefined, false);
    record.newArrival = csvBool(record.newArrival ?? undefined, false);

    const data = buildProductData(record);
    if (!data.slug || !data.name || !data.sku) {
      skipped.push({ row: i + 1, reason: "Missing slug, name, or SKU." });
      continue;
    }

    try {
      const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
      if (existing) {
        await prisma.product.update({ where: { slug: data.slug }, data });
        updated++;
      } else {
        await prisma.product.create({ data });
        created++;
      }
    } catch (err) {
      skipped.push({ row: i + 1, reason: err instanceof Error ? err.message : "Unknown error." });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { error: null, created, updated, skipped };
}
