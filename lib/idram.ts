import "server-only";
import crypto from "node:crypto";

// Idram Payment System merchant interface — see the integration doc the
// user provided ("Idram Merchant API"). Three URLs, one secret key, and one
// merchant IdramID are required; Idram issues test credentials once given
// the three URLs, then production credentials after a compliance review.
//
// This is the TEST-phase integration: bill numbers are self-verifying
// (HMAC-signed with IDRAM_SECRET_KEY) rather than looked up in a database,
// since no real checkout flow is wired to Idram yet — see the admin test
// page at /admin/idram-test. Once Idram approves production access and this
// gets wired into the real cart/checkout flow, replace this with a real
// pending-order record (mirroring how lib/orders.ts handles Stripe
// sessions), because a real flow needs to carry cart contents and customer
// contact info, not just an amount.

export const IDRAM_PAYMENT_URL = "https://banking.idram.am/Payment/GetPayment";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set — see README "Idram payment integration".`);
  }
  return value;
}

export function idramRecAccount(): string {
  return requireEnv("IDRAM_REC_ACCOUNT");
}

function billNoSignature(nonce: string, amountAmd: number): string {
  const secret = requireEnv("IDRAM_SECRET_KEY");
  return crypto.createHmac("sha256", secret).update(`${nonce}:${amountAmd}`).digest("hex").slice(0, 16);
}

/** Generates a bill number that embeds an HMAC of the amount, so the
 * precheck callback can verify it wasn't tampered with (or aimed at a
 * different amount) without a database lookup. */
export function createSignedBillNo(amountAmd: number): string {
  const nonce = crypto.randomBytes(6).toString("hex");
  return `${nonce}-${billNoSignature(nonce, amountAmd)}`;
}

export function verifySignedBillNo(billNo: string, amountAmd: number): boolean {
  const [nonce, sig] = billNo.split("-");
  if (!nonce || !sig) return false;
  const expected = billNoSignature(nonce, amountAmd);
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

/** MD5 checksum per Idram's spec: REC_ACCOUNT:AMOUNT:SECRET_KEY:BILL_NO:PAYER_ACCOUNT:TRANS_ID:TRANS_DATE */
export function computeConfirmationChecksum(fields: {
  recAccount: string;
  amount: string;
  billNo: string;
  payerAccount: string;
  transId: string;
  transDate: string;
}): string {
  const secret = requireEnv("IDRAM_SECRET_KEY");
  const parts = [
    fields.recAccount,
    fields.amount,
    secret,
    fields.billNo,
    fields.payerAccount,
    fields.transId,
    fields.transDate,
  ];
  return crypto.createHash("md5").update(parts.join(":")).digest("hex");
}
