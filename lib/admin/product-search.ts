// Shared by the admin product table's search box. Kept as a pure function so
// the matching rules are unit-testable without rendering the table, and so the
// same rules can be reused if search ever moves server-side.

export type SearchableProduct = { name: string; sku: string };

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
