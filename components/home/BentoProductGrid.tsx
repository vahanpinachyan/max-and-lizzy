"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Product } from "@/types";
import { ProductCard } from "@/components/shop/ProductCard";
import { QuickViewModal } from "@/components/shop/QuickViewModal";

export function BentoProductGrid({ big1, small }: { big1: Product; small: Product[] }) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <ProductCard product={big1} size="large" onQuickView={setQuickViewProduct} />
        <div className="grid grid-cols-2 gap-4">
          {small.map((product) => (
            <ProductCard key={product.slug} product={product} onQuickView={setQuickViewProduct} />
          ))}
        </div>
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
