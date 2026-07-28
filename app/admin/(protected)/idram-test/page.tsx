import { requireManagerSession } from "@/lib/admin/permissions";
import { IdramTestForm } from "./IdramTestForm";

export default async function IdramTestPage() {
  await requireManagerSession();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-espresso">Idram Test Payment</h1>
      <p className="mt-1 text-sm text-espresso/60">
        Internal tool for verifying the Idram integration before requesting production access. Sends a real
        transaction to Idram&apos;s system using whatever credentials are currently in <code>IDRAM_REC_ACCOUNT</code> /{" "}
        <code>IDRAM_SECRET_KEY</code> — use their test IdramID, not a real one, until Idram confirms production
        access.
      </p>
      <div className="mt-6">
        <IdramTestForm />
      </div>
    </div>
  );
}
