import "server-only";
import crypto from "node:crypto";

// Idram Payment System merchant interface — see the integration doc
// ("Idram Merchant API"). Three URLs, one secret key, and one merchant
// IdramID are required per merchant.
//
// Cart contents and customer contact info are persisted in a
// PendingIdramOrder row before the customer is redirected to Idram (see
// app/api/checkout/idram/route.ts), keyed by that row's id, which doubles
// as EDP_BILL_NO. The RESULT_URL callback (app/api/idram/callback) looks
// that row up rather than trusting anything embedded in the bill number
// itself — the row's existence and status are the source of truth.

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

export function isIdramConfigured(): boolean {
  return !!process.env.IDRAM_REC_ACCOUNT && !!process.env.IDRAM_SECRET_KEY;
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
