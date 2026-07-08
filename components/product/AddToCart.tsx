"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/lib/i18n/context";

export function AddToCart({ product, id }: { product: Product; id?: string }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const t = useTranslations();

  function handleAdd() {
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div id={id} className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-full border border-tan">
        <button
          className="h-11 w-11 text-lg text-espresso"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          aria-label={t.product.decreaseQuantity}
        >
          −
        </button>
        <span className="w-8 text-center" aria-live="polite">
          {quantity}
        </span>
        <button
          className="h-11 w-11 text-lg text-espresso"
          onClick={() => setQuantity((q) => q + 1)}
          aria-label={t.product.increaseQuantity}
        >
          +
        </button>
      </div>
      <Button size="lg" disabled={!product.inStock} onClick={handleAdd}>
        {!product.inStock ? t.product.soldOut : justAdded ? t.product.addedConfirmation : t.product.addToCart}
      </Button>
    </div>
  );
}
