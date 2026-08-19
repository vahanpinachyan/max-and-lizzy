import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeConfirmationChecksum, idramRecAccount } from "@/lib/idram";
import { createOrderFromIdramPayment } from "@/lib/orders";
import { sendNewOrderNotificationEmail } from "@/lib/checkout-emails";

// RESULT_URL — Idram posts here twice per payment: once to confirm the
// order is real before charging the customer (EDP_PRECHECK=YES), and once
// after the charge completes. Both replies must be the literal text "OK"
// with no HTML, or Idram treats it as a failure and sends the customer to
// FAIL_URL / re-sends via email instead. Must never throw — an unhandled
// exception becomes a raw 500 with no body, which Idram (and any external
// webhook caller) can't distinguish from a network failure.
export async function POST(request: Request) {
  if (!process.env.IDRAM_REC_ACCOUNT || !process.env.IDRAM_SECRET_KEY) {
    console.error("[idram] Callback received but IDRAM_REC_ACCOUNT/IDRAM_SECRET_KEY aren't set.");
    return new NextResponse("FAIL", { status: 500 });
  }

  try {
    const form = await request.formData();
    const get = (key: string) => String(form.get(key) ?? "");

    const recAccount = get("EDP_REC_ACCOUNT");
    const billNo = get("EDP_BILL_NO");
    const amount = get("EDP_AMOUNT");

    if (get("EDP_PRECHECK") === "YES") {
      const pending = await prisma.pendingIdramOrder.findUnique({ where: { id: billNo } });
      const amountMatches = pending && Math.round(Number(amount)) === pending.amountAmd;
      const valid = recAccount === idramRecAccount() && pending?.status === "pending" && amountMatches;
      if (!valid) {
        console.warn(`[idram] Precheck rejected — bill=${billNo} amount=${amount} recAccount=${recAccount}`);
        return new NextResponse("FAIL", { status: 400 });
      }
      return new NextResponse("OK", { headers: { "Content-Type": "text/plain" } });
    }

    const payerAccount = get("EDP_PAYER_ACCOUNT");
    const transId = get("EDP_TRANS_ID");
    const transDate = get("EDP_TRANS_DATE");
    const checksum = get("EDP_CHECKSUM");

    const expected = computeConfirmationChecksum({ recAccount, amount, billNo, payerAccount, transId, transDate });
    if (expected.toLowerCase() !== checksum.toLowerCase()) {
      console.error(`[idram] Checksum mismatch — bill=${billNo}, possible spoofed confirmation request`);
      return new NextResponse("FAIL", { status: 400 });
    }

    const pending = await prisma.pendingIdramOrder.findUnique({ where: { id: billNo } });
    if (!pending) {
      console.error(`[idram] Confirmation for unknown bill=${billNo}`);
      return new NextResponse("FAIL", { status: 400 });
    }

    const order = await createOrderFromIdramPayment(pending);
    if (pending.status === "pending") {
      await prisma.pendingIdramOrder.update({ where: { id: billNo }, data: { status: "confirmed" } });
    }

    console.log(
      `[idram] Payment confirmed — bill=${billNo} amount=${amount} payer=${payerAccount} transId=${transId} date=${transDate}`
    );

    await sendNewOrderNotificationEmail(order, pending.customerEmail);

    return new NextResponse("OK", { headers: { "Content-Type": "text/plain" } });
  } catch (err) {
    console.error("[idram] Callback handler error:", err);
    return new NextResponse("FAIL", { status: 500 });
  }
}
