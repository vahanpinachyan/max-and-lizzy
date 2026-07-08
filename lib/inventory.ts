export const LOW_STOCK_THRESHOLD = 5;

export function isLowStock(product: { inStock: boolean; stockQuantity: number | null }): boolean {
  return product.inStock && product.stockQuantity !== null && product.stockQuantity <= LOW_STOCK_THRESHOLD;
}
