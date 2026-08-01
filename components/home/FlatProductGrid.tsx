"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Product } from "@/types";
import { ProductCard } from "@/components/shop/ProductCard";
import { QuickViewModal } from "@/components/shop/QuickViewModal";

export function FlatProductGrid({ products }: { products: Product[] }) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} onQuickView={setQuickViewProduct} />
        ))}
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
    </>
  );
}
