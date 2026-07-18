"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { trackStartedCheckout } from "@/lib/omnisend-client";
import { formatAmd } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { Button, LinkButton } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";
import { SectionDecorations } from "@/components/ui/Decorations";
import { useTranslations, useI18n } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/interpolate";
import { GIFT_WRAP_FEE_AMD, type FulfillmentMethod } from "@/data/fulfillment";
import { localizeFulfillmentOptions } from "@/lib/i18n/localize-data";

export default function CartPage() {
  const t = useTranslations();
  const { locale } = useI18n();
  const {
    items,
    cartId,
    updateQuantity,
    removeItem,
    subtotalAmd,
    promoCode,
    promoDescription,
    discountAmd,
    totalAmd,
    applyPromoCode,
    removePromoCode,
  } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("pickup");
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  const fulfillmentOptions = localizeFulfillmentOptions(locale);
  const selectedFulfillment = fulfillmentOptions.find((o) => o.id === fulfillmentMethod);
  const deliveryFeeAmd = selectedFulfillment?.feeAmd ?? 0;
  const giftWrapFeeAmd = giftWrap ? GIFT_WRAP_FEE_AMD : 0;
  const grandTotalAmd = totalAmd + deliveryFeeAmd + giftWrapFeeAmd;

  async function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const result = await applyPromoCode(promoInput);
    setPromoMessage({ text: result.message, ok: result.success });
    if (result.success) setPromoInput("");
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    if (cartId) trackStartedCheckout(items, grandTotalAmd, cartId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
          promoCode,
          fulfillmentMethod,
          giftWrap,
          giftMessage: giftWrap ? giftMessage : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || t.cart.checkoutErrorGeneric);
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t.cart.checkoutErrorRetry);
      setLoading(false);
    }
  }

  return (
    <Container className="relative overflow-hidden py-12">
      <SectionDecorations variant="flowers" />
      <h1 className="relative text-4xl font-bold text-espresso">{t.cart.title}</h1>

      {items.length === 0 ? (
        <div className="relative mt-10 flex flex-col items-center text-center">
          <Mascot className="h-36 w-36" />
          <p className="mt-3 text-espresso/70">{t.cart.empty}</p>
          <LinkButton href="/shop" className="mt-6">
            {t.cart.continueShopping}
          </LinkButton>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-tan/40 border-y border-tan/40">
            {items.map((item) => (
              <li key={item.slug} className="flex gap-4 py-6">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-beige">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <Link href={`/product/${item.slug}`} className="font-semibold text-espresso hover:text-terracotta-dark">
                      {item.name}
                    </Link>
                    <p className="font-semibold text-espresso">{formatAmd(item.priceAmd * item.quantity, locale)}</p>
                  </div>
                  <p className="text-sm text-espresso/70">{formatAmd(item.priceAmd, locale)} {t.cart.each}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center rounded-full border border-tan">
                      <button
                        className="h-9 w-9 text-espresso"
                        onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                        aria-label={interpolate(t.cart.decreaseAriaLabel, { name: item.name })}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        className="h-9 w-9 text-espresso"
                        onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                        aria-label={interpolate(t.cart.increaseAriaLabel, { name: item.name })}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.slug)}
                      className="text-sm text-espresso/70 underline hover:text-terracotta-dark"
                    >
                      {t.cart.remove}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-2xl border border-tan/50 bg-white p-6">
            <h2 className="text-lg font-bold text-espresso">{t.cart.orderSummary}</h2>

            <div className="mt-4">
              {promoCode ? (
                <div className="flex items-center justify-between rounded-xl bg-sage/10 px-3 py-2 text-sm">
                  <span className="font-semibold text-sage-dark">
                    {promoCode} {t.cart.promoApplied} — {promoDescription}
                  </span>
                  <button
                    onClick={() => {
                      removePromoCode();
                      setPromoMessage(null);
                    }}
                    className="text-espresso/60 underline hover:text-terracotta-dark"
                  >
                    {t.cart.remove}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <label htmlFor="promo-code" className="sr-only">
                    {t.cart.promoPlaceholder}
                  </label>
                  <input
                    id="promo-code"
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder={t.cart.promoPlaceholder}
                    className="min-w-0 flex-1 rounded-full border border-tan bg-white px-4 py-2 text-sm uppercase placeholder:normal-case focus:outline-none"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    {t.cart.promoApply}
                  </Button>
                </form>
              )}
              {promoMessage && (
                <p
                  className={`mt-2 text-sm ${promoMessage.ok ? "text-sage-dark" : "text-terracotta-dark"}`}
                  role="alert"
                >
                  {promoMessage.text}
                </p>
              )}
            </div>

            <fieldset className="mt-6 border-t border-tan/50 pt-4">
              <legend className="text-sm font-semibold text-espresso">{t.cart.fulfillmentLabel}</legend>
              <div className="mt-2 space-y-2">
                {fulfillmentOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      fulfillmentMethod === option.id
                        ? "border-terracotta bg-terracotta/5"
                        : "border-tan/60 hover:border-tan"
                    }`}
                  >
                    <input
                      type="radio"
                      name="fulfillment-method"
                      value={option.id}
                      checked={fulfillmentMethod === option.id}
                      onChange={() => setFulfillmentMethod(option.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 text-terracotta focus-visible:outline-terracotta"
                    />
                    <span className="flex-1">
                      <span className="flex items-center justify-between gap-2 font-semibold text-espresso">
                        {option.label}
                        <span className="font-normal text-espresso/70">
                          {option.feeAmd > 0 ? `+${formatAmd(option.feeAmd, locale)}` : t.cart.free}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-espresso/70">{option.eta}</span>
                      {option.note && <span className="mt-0.5 block text-xs text-espresso/50">{option.note}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 border-t border-tan/50 pt-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="h-4 w-4 rounded border-tan text-terracotta focus-visible:outline-terracotta"
                />
                <span className="font-semibold text-espresso">
                  {interpolate(t.cart.giftWrapCheckboxLabel, { fee: formatAmd(GIFT_WRAP_FEE_AMD, locale) })}
                </span>
              </label>
              {giftWrap && (
                <div className="mt-3">
                  <label htmlFor="gift-message" className="sr-only">
                    {t.cart.giftMessageLabel}
                  </label>
                  <textarea
                    id="gift-message"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder={t.cart.giftMessagePlaceholder}
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 space-y-1.5 border-t border-tan/50 pt-4">
              <div className="flex justify-between text-espresso/80">
                <span>{t.cart.subtotal}</span>
                <span>{formatAmd(subtotalAmd, locale)}</span>
              </div>
              {discountAmd > 0 && (
                <div className="flex justify-between text-sage-dark">
                  <span>{t.cart.discount}</span>
                  <span>−{formatAmd(discountAmd, locale)}</span>
                </div>
              )}
              {deliveryFeeAmd > 0 && (
                <div className="flex justify-between text-espresso/80">
                  <span>{t.cart.deliveryFeeLineLabel}</span>
                  <span>{formatAmd(deliveryFeeAmd, locale)}</span>
                </div>
              )}
              {giftWrapFeeAmd > 0 && (
                <div className="flex justify-between text-espresso/80">
                  <span>{t.cart.giftWrapLineLabel}</span>
                  <span>{formatAmd(giftWrapFeeAmd, locale)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-tan/50 pt-1.5 text-lg font-bold text-espresso">
                <span>{t.cart.total}</span>
                <span>{formatAmd(grandTotalAmd, locale)}</span>
              </div>
            </div>

            <p className="mt-2 text-xs text-espresso/70">
              {t.cart.shippingNote}
            </p>
            <Button size="lg" className="mt-6 w-full" onClick={handleCheckout} disabled={loading}>
              {loading ? t.cart.checkoutRedirecting : t.cart.checkout}
            </Button>
            {error && <p className="mt-3 text-sm text-terracotta-dark" role="alert">{error}</p>}
            <p className="mt-4 text-xs text-espresso/70">
              {t.cart.secureCheckoutNote}{" "}
              <Link href="/policies/returns" className="underline">{t.cart.returnPolicy}</Link> {t.cart.and}{" "}
              <Link href="/policies/shipping" className="underline">{t.cart.shippingPolicy}</Link>.
            </p>
          </div>
        </div>
      )}
    </Container>
  );
}
