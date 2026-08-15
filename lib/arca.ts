import "server-only";

// ACBA's ArCa vPOS — SmartVista E-Commerce Payment Gateway (EPG), the same
// REST platform (register.do / getOrderStatusExtended.do) used by several
// Armenian banks under their own branding. See the bank's "EPG Merchant
// Integration Guide" for the full spec; this only implements the one-phase
// payment flow (register.do, not registerPreAuth.do) since the store
// doesn't need auth-then-capture.
//
// Unlike Idram, EPG has no documented server-to-server push callback in the
// merchant integration guide (there's a "Sending callback notification is
// allowed" permission flag, which would need to be requested from ACBA
// separately) — so instead of verifying an inbound webhook checksum, we
// pull the authoritative status ourselves: register.do gives us an
// epgOrderId, we redirect the customer to formUrl, and when their browser
// returns to returnUrl (see app/(site)/checkout/arca/return) we call
// getOrderStatusExtended.do with our own merchant credentials to find out
// what actually happened. That call is authenticated with our own
// userName/password, not anything the client supplied, so it's just as
// trustworthy as Idram's checksum-verified callback — there's no signature
// to spoof because we're the one asking, not the one being told.

export const ARCA_API_URL = "https://epg.arca.am/payment/rest/";

// ISO 4217 numeric currency code for Armenian dram.
const ARCA_CURRENCY_AMD = "051";

// orderStatus values from getOrderStatusExtended.do. Only the ones this
// integration branches on are named — everything else (pre-auth held,
// reversed, refunded, ACS-in-progress) is treated as "not paid yet" rather
// than guessed at, since a one-phase register.do payment should only ever
// land on DEPOSITED or DECLINED.
export const ARCA_ORDER_STATUS = {
  REGISTERED_NOT_PAID: 0,
  DEPOSITED: 2,
  DECLINED: 6,
} as const;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set — see README "ARCA (ACBA vPOS) payment integration".`);
  }
  return value;
}

function arcaCredentials(): { userName: string; password: string } {
  return { userName: requireEnv("ARCA_USERNAME"), password: requireEnv("ARCA_PASSWORD") };
}

export function isArcaConfigured(): boolean {
  return !!process.env.ARCA_USERNAME && !!process.env.ARCA_PASSWORD;
}

async function postToArca(method: string, params: Record<string, string>): Promise<Record<string, unknown> | null> {
  const { userName, password } = arcaCredentials();
  const body = new URLSearchParams({ userName, password, ...params });

  let response: Response;
  try {
    response = await fetch(`${ARCA_API_URL}${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Required by the gateway per the integration guide.
        Accept: "application/json, text/javascript, */*;",
      },
      body,
    });
  } catch (err) {
    console.error(`[arca] ${method} request failed:`, err);
    return null;
  }

  const data = await response.json().catch(() => null);
  if (!data || typeof data !== "object") {
    console.error(`[arca] ${method} returned a non-JSON response (status ${response.status})`);
    return null;
  }
  return data as Record<string, unknown>;
}

export interface ArcaRegisterResult {
  orderId: string;
  formUrl: string;
}

/** register.do — creates a one-phase order and returns the hosted payment page URL. */
export async function registerArcaOrder(fields: {
  orderNumber: string;
  amountAmd: number;
  returnUrl: string;
  description: string;
  language: string;
}): Promise<{ ok: true; result: ArcaRegisterResult } | { ok: false; error: string }> {
  const data = await postToArca("register.do", {
    orderNumber: fields.orderNumber,
    // "Order amount in the minor denomination" — AMD's minor unit (luma),
    // same convention as lib/stripe.ts's unit_amount for AMD.
    amount: String(Math.round(fields.amountAmd * 100)),
    currency: ARCA_CURRENCY_AMD,
    returnUrl: fields.returnUrl,
    description: fields.description.slice(0, 600),
    language: fields.language,
  });

  if (!data) {
    return { ok: false, error: "Unable to reach the payment gateway. Please try again." };
  }

  const errorCode = data.errorCode != null ? String(data.errorCode) : "0";
  if (errorCode !== "0") {
    console.error(`[arca] register.do error ${errorCode}: ${data.errorMessage}`);
    return { ok: false, error: typeof data.errorMessage === "string" ? data.errorMessage : "Unable to start payment." };
  }
  if (typeof data.orderId !== "string" || typeof data.formUrl !== "string") {
    console.error("[arca] register.do succeeded but didn't return orderId/formUrl:", data);
    return { ok: false, error: "Payment gateway did not return a payment page." };
  }

  return { ok: true, result: { orderId: data.orderId, formUrl: data.formUrl } };
}

export interface ArcaOrderStatusResult {
  orderStatus: number | null;
  /** Amount in the minor denomination (same convention as the request). */
  amountMinor: number | null;
  actionCodeDescription: string | null;
}

/** getOrderStatusExtended.do — the authoritative pull check, see module comment above. */
export async function getArcaOrderStatus(orderId: string): Promise<ArcaOrderStatusResult | null> {
  const data = await postToArca("getOrderStatusExtended.do", { orderId });
  if (!data) return null;

  const orderStatus = data.orderStatus != null ? Number(data.orderStatus) : null;
  const amountMinor = data.amount != null ? Number(data.amount) : null;
  return {
    orderStatus: Number.isFinite(orderStatus) ? orderStatus : null,
    amountMinor: Number.isFinite(amountMinor) ? amountMinor : null,
    actionCodeDescription: typeof data.actionCodeDescription === "string" ? data.actionCodeDescription : null,
  };
}
