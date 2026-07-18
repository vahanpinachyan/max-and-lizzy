export type FulfillmentMethod = "pickup" | "delivery_yerevan" | "delivery_outside";

export interface FulfillmentOption {
  id: FulfillmentMethod;
  feeAmd: number;
  label: string;
  eta: string;
  note?: string;
}

export const FULFILLMENT_OPTIONS: FulfillmentOption[] = [
  {
    id: "pickup",
    feeAmd: 0,
    label: "Pickup — 50 Mashtots Avenue",
    eta: "Free, ready same-day",
  },
  {
    id: "delivery_yerevan",
    feeAmd: 500,
    label: "Delivery within Yerevan",
    eta: "Within 24 hours",
  },
  {
    id: "delivery_outside",
    feeAmd: 1000,
    label: "Delivery outside Yerevan",
    eta: "3–5 days via Haypost courier",
    note: "Final courier cost may vary by weight",
  },
];

export const GIFT_WRAP_FEE_AMD = 600;

export function getFulfillmentOption(id: string | null | undefined): FulfillmentOption | undefined {
  return FULFILLMENT_OPTIONS.find((o) => o.id === id);
}
