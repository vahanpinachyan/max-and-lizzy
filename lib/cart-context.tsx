"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "@/types";
import type { Locale } from "@/lib/i18n/locales";
import { useI18n } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/interpolate";
import { trackAddedToCart } from "@/lib/omnisend-client";

const STORAGE_KEY = "max-and-lizzy-cart";
const PROMO_STORAGE_KEY = "max-and-lizzy-promo-code";
const CART_ID_STORAGE_KEY = "max-and-lizzy-cart-id";

interface AppliedPromo {
  code: string;
  percentOff: number;
  description: string;
}

interface CartContextValue {
  items: CartItem[];
  cartId: string;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  subtotalAmd: number;
  itemCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  promoCode: string | null;
  promoDescription: string | null;
  discountAmd: number;
  totalAmd: number;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

async function validatePromoCode(code: string, locale: Locale): Promise<AppliedPromo | null> {
  try {
    const res = await fetch(`/api/promo-codes?code=${encodeURIComponent(code)}&locale=${locale}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.promo ?? null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { dict: t, locale } = useI18n();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  // Stable per-browser cart identifier, sent with Omnisend cart/checkout
  // abandonment events so a returning visitor's activity links back to the
  // same abandoned cart rather than starting a new one every session.
  const [cartId, setCartId] = useState("");

  useEffect(() => {
    // One-time hydration from localStorage: this value doesn't exist during
    // SSR, so it can only be read after mount on the client.
    let storedPromoCode: string | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
      storedPromoCode = window.localStorage.getItem(PROMO_STORAGE_KEY);

      let storedCartId = window.localStorage.getItem(CART_ID_STORAGE_KEY);
      if (!storedCartId) {
        storedCartId = crypto.randomUUID();
        window.localStorage.setItem(CART_ID_STORAGE_KEY, storedCartId);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartId(storedCartId);
    } catch {
      // ignore corrupt local storage
    }
    setHydrated(true);

    // Re-validate against the DB rather than trusting whatever was saved —
    // a promo could have been deactivated since the last visit.
    if (storedPromoCode) {
      validatePromoCode(storedPromoCode, locale).then((found) => {
        if (found) setPromo(found);
      });
    }
    // Only re-run this hydration effect once on mount, regardless of locale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (promo) window.localStorage.setItem(PROMO_STORAGE_KEY, promo.code);
    else window.localStorage.removeItem(PROMO_STORAGE_KEY);
  }, [promo, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === product.slug);
      const next = existing
        ? prev.map((i) =>
            i.slug === product.slug ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [
            ...prev,
            {
              slug: product.slug,
              name: product.name,
              priceAmd: product.priceAmd,
              image: product.images[0]?.src ?? "",
              quantity,
              sku: product.sku,
            },
          ];
      // Fired from inside the updater so it always sees the resulting cart
      // contents/value — a harmless side effect (analytics, not state).
      if (cartId) trackAddedToCart(product, quantity, next, cartId);
      return next;
    });
    setIsDrawerOpen(true);
  }, [cartId]);

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.slug !== slug);
      return prev.map((i) => (i.slug === slug ? { ...i, quantity } : i));
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromo(null);
  }, []);

  const applyPromoCode = useCallback(
    async (code: string) => {
      const found = await validatePromoCode(code, locale);
      if (!found) {
        return { success: false, message: t.cart.promoInvalid };
      }
      setPromo(found);
      return { success: true, message: interpolate(t.cart.promoAppliedMessage, { description: found.description }) };
    },
    [t, locale]
  );

  const removePromoCode = useCallback(() => setPromo(null), []);

  const subtotalAmd = useMemo(
    () => items.reduce((sum, i) => sum + i.priceAmd * i.quantity, 0),
    [items]
  );
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const discountAmd = promo ? Math.round((subtotalAmd * promo.percentOff) / 100) : 0;
  const totalAmd = Math.max(0, subtotalAmd - discountAmd);

  const value: CartContextValue = {
    items,
    cartId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotalAmd,
    itemCount,
    isDrawerOpen,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    promoCode: promo?.code ?? null,
    promoDescription: promo?.description ?? null,
    discountAmd,
    totalAmd,
    applyPromoCode,
    removePromoCode,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
