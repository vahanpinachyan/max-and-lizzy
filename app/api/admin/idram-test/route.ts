import { NextResponse } from "next/server";
import { requireManagerAction } from "@/lib/admin/permissions";
import { absoluteUrl } from "@/lib/seo";
import { createSignedBillNo, idramRecAccount, IDRAM_PAYMENT_URL } from "@/lib/idram";

// Manager-only tool for verifying the Idram RESULT_URL/SUCCESS_URL/FAIL_URL
// integration works before Idram grants production access — see
// /admin/idram-test and README "Idram payment integration".
export async function POST(request: Request) {
  try {
    await requireManagerAction();
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let body: { amount?: number; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const amountAmd = Number(body.amount);
  if (!Number.isFinite(amountAmd) || amountAmd <= 0) {
    return NextResponse.json({ error: "Enter a valid amount greater than zero." }, { status: 400 });
  }

  if (!process.env.IDRAM_REC_ACCOUNT || !process.env.IDRAM_SECRET_KEY) {
    return NextResponse.json(
      { error: "IDRAM_REC_ACCOUNT / IDRAM_SECRET_KEY aren't set yet — add them once Idram issues test credentials." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    actionUrl: IDRAM_PAYMENT_URL,
    fields: {
      EDP_LANGUAGE: "EN",
      EDP_REC_ACCOUNT: idramRecAccount(),
      EDP_DESCRIPTION: (body.description || "Max & Lizzy test payment").slice(0, 200),
      EDP_AMOUNT: amountAmd.toFixed(2),
      EDP_BILL_NO: createSignedBillNo(amountAmd),
    },
    successUrl: absoluteUrl("/checkout/idram/success"),
    failUrl: absoluteUrl("/checkout/idram/fail"),
    resultUrl: absoluteUrl("/api/idram/callback"),
  });
}
