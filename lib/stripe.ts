import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

// Lazily constructed so the app can build without Stripe keys present
// (e.g. before real keys are supplied). Throws only when checkout is
// actually invoked without a configured key.
export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local — see .env.example."
    );
  }
  stripeInstance = new Stripe(key, {
    apiVersion: "2026-06-24.dahlia",
  });
  return stripeInstance;
}
