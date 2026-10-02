// Shared by the admin product table's search box and the storefront shop
// filter. Kept as pure functions so the matching rules are unit-testable
// without rendering either, and so the same rules can be reused if search ever
// moves server-side.

export type SearchableProduct = { name: string; sku: string };

export type ShopSearchableProduct = SearchableProduct & {
  shortDescription: string;
  materials: string[];
};

/**
 * Matches a product against a staff search term, case-insensitively, on either
 * the product name or the SKU.
 *
 * Staff usually read the SKU straight off the box, so an exact SKU is the
 * common case; substring matching covers partial recall of a name. An empty or
 * whitespace-only term matches everything, so clearing the box restores the
 * full list rather than emptying it.
 */
export function matchesProductQuery(product: SearchableProduct, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q);
}

export function filterProducts<T extends SearchableProduct>(products: T[], query: string): T[] {
  if (!query.trim()) return products;
  return products.filter((p) => matchesProductQuery(p, query));
}

/**
 * Storefront version. Wider than the admin one — a customer may search a word
 * from the blurb or a material — but it must also match the SKU: staff read
 * SKUs off the box and search the public shop with them, and customers quote
 * them from a receipt or a price label.
 */
export function matchesShopQuery(product: ShopSearchableProduct, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    product.name.toLowerCase().includes(q) ||
    product.sku.toLowerCase().includes(q) ||
    product.shortDescription.toLowerCase().includes(q) ||
    product.materials.some((m) => m.toLowerCase().includes(q))
  );
}
