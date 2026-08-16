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
import { Select } from "@/components/ui/Select";
import { SectionDecorations, Cloud, Flower } from "@/components/ui/Decorations";
import { useTranslations, useI18n } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/interpolate";
import { GIFT_WRAP_FEE_AMD, type FulfillmentMethod } from "@/data/fulfillment";
import { localizeFulfillmentOptions, localizeArmeniaRegions } from "@/lib/i18n/localize-data";

interface DeliveryAddress {
  region: string;
  city: string;
  street: string;
  apartment: string;
  entrance: string;
  floor: string;
}

const EMPTY_ADDRESS: DeliveryAddress = { region: "", city: "", street: "", apartment: "", entrance: "", floor: "" };

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
  const [address, setAddress] = useState<DeliveryAddress>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<"idram" | "arca">("arca");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const fulfillmentOptions = localizeFulfillmentOptions(locale);
  const regions = localizeArmeniaRegions(locale);
  const selectedFulfillment = fulfillmentOptions.find((o) => o.id === fulfillmentMethod);
  const deliveryFeeAmd = selectedFulfillment?.feeAmd ?? 0;
  const giftWrapFeeAmd = giftWrap ? GIFT_WRAP_FEE_AMD : 0;
  const grandTotalAmd = totalAmd + deliveryFeeAmd + giftWrapFeeAmd;

  // Red-border validation state — only kicks in after a checkout attempt
  // fails, and clears itself live as each field gets fixed (derived from
  // current values, not frozen at submit time).
  const firstNameInvalid = attemptedSubmit && !firstName.trim();
  const lastNameInvalid = attemptedSubmit && !lastName.trim();
  const emailInvalid = attemptedSubmit && (!email.trim() || !email.includes("@"));
  const phoneInvalid = attemptedSubmit && !phone.trim();
  const regionInvalid = attemptedSubmit && fulfillmentMethod === "delivery_outside" && !address.region;
  const cityInvalid = attemptedSubmit && fulfillmentMethod === "delivery_outside" && !address.city.trim();
  const streetInvalid = attemptedSubmit && fulfillmentMethod !== "pickup" && !address.street.trim();

  function fieldBorderClass(invalid: boolean) {
    return invalid ? "border-terracotta-dark" : "border-tan";
  }

  function updateAddress(field: keyof DeliveryAddress, value: string) {
    setAddress((a) => ({ ...a, [field]: value }));
  }

  function validateAddress(): string | null {
    if (fulfillmentMethod === "delivery_yerevan" && !address.street.trim()) {
      return t.cart.addressRequiredError;
    }
    if (fulfillmentMethod === "delivery_outside" && (!address.region || !address.city.trim() || !address.street.trim())) {
      return t.cart.addressRequiredError;
    }
    return null;
  }

  async function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const result = await applyPromoCode(promoInput);
    setPromoMessage({ text: result.message, ok: result.success });
    if (result.success) setPromoInput("");
  }

  function submitIdramForm(actionUrl: string, fields: Record<string, string>) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = actionUrl;
    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  }

  async function handleCheckout() {
    setAttemptedSubmit(true);

    const addressError = validateAddress();
    if (addressError) {
      setError(addressError);
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError(t.cart.nameRequiredError);
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError(t.cart.emailRequiredError);
      return;
    }
    if (!phone.trim()) {
      setError(t.cart.phoneRequiredError);
      return;
    }
    setLoading(true);
    setError(null);
    if (cartId) trackStartedCheckout(items, grandTotalAmd, cartId);

    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    const sharedBody = {
      items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
      promoCode,
      fulfillmentMethod,
      giftWrap,
      giftMessage: giftWrap ? giftMessage : undefined,
      notes: notes.trim() || undefined,
      deliveryAddress: fulfillmentMethod !== "pickup" ? address : undefined,
      name,
    };

    try {
      if (paymentMethod === "idram") {
        const res = await fetch("/api/checkout/idram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...sharedBody, email, phone }),
        });
        const data = await res.json();
        if (!res.ok || !data.actionUrl) {
          throw new Error(data.error || t.cart.checkoutErrorGeneric);
        }
        submitIdramForm(data.actionUrl, data.fields);
        return;
      }

      const res = await fetch("/api/checkout/arca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sharedBody, email, phone, locale }),
      });
      const data = await res.json();
      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.error || t.cart.checkoutErrorGeneric);
      }
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : t.cart.checkoutErrorRetry);
      setLoading(false);
    }
  }

  return (
    <Container className="relative py-12">
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
          <div>
          {/* The whole group (list + mascots) is one sticky unit, so the
              gap between them holds steady while scrolling instead of the
              two fighting over independent sticky offsets. Still adapts to
              a cart of 1 or 10 — a long list just leaves the block less
              "room" to travel before it un-sticks, same as before. */}
          <div className="lg:sticky lg:top-24">
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
                  <div className="mt-2 flex items-center justify-between gap-4">
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
          <div aria-hidden="true" className="pointer-events-none relative mt-10 hidden items-end justify-center gap-4 lg:flex">
            <Flower className="absolute left-[2%] top-2 h-auto w-5 -rotate-12 opacity-25" />
            <Cloud fill="var(--color-tan)" className="absolute left-[14%] -top-4 h-auto w-14 opacity-40" />
            <Flower className="absolute left-[24%] top-0 h-auto w-4 rotate-12 opacity-20" />
            <Cloud fill="var(--color-tan)" className="absolute right-[10%] -top-6 h-auto w-16 opacity-40" />
            <Flower className="absolute right-[22%] top-4 h-auto w-6 rotate-45 opacity-20" />
            <Flower className="absolute right-[2%] top-6 h-auto w-5 -rotate-6 opacity-25" />
            <Cloud fill="var(--color-tan)" className="absolute left-[0%] bottom-6 h-auto w-10 opacity-30" />
            <Flower className="absolute left-[8%] bottom-0 h-auto w-7 rotate-6 opacity-20" />
            <Flower className="absolute left-1/2 bottom-2 h-auto w-4 -translate-x-1/2 -rotate-12 opacity-15" />
            <Cloud fill="var(--color-tan)" className="absolute right-[0%] bottom-8 h-auto w-12 opacity-30" />
            <Flower className="absolute right-[8%] bottom-0 h-auto w-6 -rotate-12 opacity-25" />
            <Image
              src="/images/hero-max-v1.png"
              alt=""
              width={826}
              height={1665}
              className="relative h-auto w-40 select-none opacity-20 xl:w-48"
            />
            <Image
              src="/images/hero-lizzy-v1.png"
              alt=""
              width={874}
              height={1665}
              className="relative h-auto w-40 select-none opacity-20 xl:w-48"
            />
          </div>
          </div>
          </div>

          <div className="h-fit rounded-2xl border border-tan/50 bg-white p-6">
            <h2 className="text-lg font-bold text-espresso">{t.cart.orderSummary}</h2>

            <div className="mt-4">
              {promoCode ? (
                <div className="flex items-center justify-between rounded-xl bg-sage/10 px-3 py-2 text-sm">
                  <span className="font-semibold text-sage-dark">
                    {promoCode} {t.cart.promoApplied}: {promoDescription}
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

            <fieldset className="mt-4 border-t border-tan/50 pt-4">
              <legend className="text-sm font-semibold text-espresso">{t.cart.paymentMethodLabel}</legend>
              <div className="mt-2 space-y-2">
                {(
                  [
                    { id: "arca" as const, label: t.cart.paymentMethodArca, note: t.cart.paymentMethodArcaNote },
                    { id: "idram" as const, label: t.cart.paymentMethodIdram, note: t.cart.paymentMethodIdramNote },
                  ]
                ).map((option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      paymentMethod === option.id ? "border-terracotta bg-terracotta/5" : "border-tan/60 hover:border-tan"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={option.id}
                      checked={paymentMethod === option.id}
                      onChange={() => setPaymentMethod(option.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 text-terracotta focus-visible:outline-terracotta"
                    />
                    <span className="flex-1">
                      <span className="block font-semibold text-espresso">{option.label}</span>
                      <span className="mt-0.5 block text-espresso/70">{option.note}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="checkout-first-name" className="sr-only">
                      {t.cart.firstNameLabel}
                    </label>
                    <input
                      id="checkout-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t.cart.firstNamePlaceholder}
                      className={`w-full rounded-full border bg-white px-4 py-2 text-sm focus:outline-none ${fieldBorderClass(firstNameInvalid)}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-last-name" className="sr-only">
                      {t.cart.lastNameLabel}
                    </label>
                    <input
                      id="checkout-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t.cart.lastNamePlaceholder}
                      className={`w-full rounded-full border bg-white px-4 py-2 text-sm focus:outline-none ${fieldBorderClass(lastNameInvalid)}`}
                    />
                  </div>
                </div>
                <label htmlFor="checkout-email" className="sr-only">
                  {t.cart.emailLabel}
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.cart.emailPlaceholder}
                  className={`w-full rounded-full border bg-white px-4 py-2 text-sm focus:outline-none ${fieldBorderClass(emailInvalid)}`}
                />
                <label htmlFor="checkout-phone" className="sr-only">
                  {t.cart.phoneLabel}
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.cart.phonePlaceholder}
                  className={`w-full rounded-full border bg-white px-4 py-2 text-sm focus:outline-none ${fieldBorderClass(phoneInvalid)}`}
                />
              </div>
            </fieldset>

            <div className="mt-4 border-t border-tan/50 pt-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="form-checkbox"
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

            {fulfillmentMethod === "pickup" ? (
              <p className="mt-4 rounded-xl bg-sage/10 px-3 py-2 text-sm text-sage-dark">
                {t.cart.pickupReadyNote}
              </p>
            ) : (
              <fieldset className="mt-4 border-t border-tan/50 pt-4">
                <legend className="text-sm font-semibold text-espresso">{t.cart.deliveryAddressLabel}</legend>
                <div className="mt-2 space-y-2">
                  {fulfillmentMethod === "delivery_outside" && (
                    <>
                      <label htmlFor="address-region" className="sr-only">{t.cart.regionLabel}</label>
                      <Select
                        id="address-region"
                        value={address.region}
                        onChange={(v) => updateAddress("region", v)}
                        placeholder={t.cart.regionPlaceholder}
                        options={regions.map((r) => ({ value: r.id, label: r.label }))}
                        invalid={regionInvalid}
                      />
                      <label htmlFor="address-city" className="sr-only">{t.cart.cityLabel}</label>
                      <input
                        id="address-city"
                        type="text"
                        value={address.city}
                        onChange={(e) => updateAddress("city", e.target.value)}
                        placeholder={t.cart.cityPlaceholder}
                        className={`w-full rounded-full border bg-white px-4 py-2 text-sm focus:outline-none ${fieldBorderClass(cityInvalid)}`}
                      />
                    </>
                  )}
                  <label htmlFor="address-street" className="sr-only">{t.cart.streetLabel}</label>
                  <input
                    id="address-street"
                    type="text"
                    value={address.street}
                    onChange={(e) => updateAddress("street", e.target.value)}
                    placeholder={t.cart.streetPlaceholder}
                    className={`w-full rounded-full border bg-white px-4 py-2 text-sm focus:outline-none ${fieldBorderClass(streetInvalid)}`}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label htmlFor="address-apartment" className="sr-only">{t.cart.apartmentLabel}</label>
                      <input
                        id="address-apartment"
                        type="text"
                        value={address.apartment}
                        onChange={(e) => updateAddress("apartment", e.target.value)}
                        placeholder={t.cart.apartmentLabel}
                        className="w-full rounded-full border border-tan bg-white px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="address-entrance" className="sr-only">{t.cart.entranceLabel}</label>
                      <input
                        id="address-entrance"
                        type="text"
                        value={address.entrance}
                        onChange={(e) => updateAddress("entrance", e.target.value)}
                        placeholder={t.cart.entranceLabel}
                        className="w-full rounded-full border border-tan bg-white px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="address-floor" className="sr-only">{t.cart.floorLabel}</label>
                      <input
                        id="address-floor"
                        type="text"
                        value={address.floor}
                        onChange={(e) => updateAddress("floor", e.target.value)}
                        placeholder={t.cart.floorLabel}
                        className="w-full rounded-full border border-tan bg-white px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            <div className="mt-4 border-t border-tan/50 pt-4">
              <label htmlFor="checkout-notes" className="text-sm font-semibold text-espresso">
                {t.cart.notesLabel}
              </label>
              <textarea
                id="checkout-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.cart.notesPlaceholder}
                rows={2}
                maxLength={1000}
                className="mt-2 w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm focus:outline-none"
              />
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
