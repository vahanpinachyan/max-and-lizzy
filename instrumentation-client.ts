import posthog from "posthog-js";

// Captures a PostHog pageview on every client-side navigation, using
// Next.js's onRouterTransitionStart hook (App Router navigations don't
// reload the page, so there's no native pageload event to hook into).
// posthog.init() itself lives in components/marketing/PostHogInit.tsx,
// deliberately NOT here — see that file for why. Set NEXT_PUBLIC_POSTHOG_KEY
// in your environment (see .env.example) to enable; no-ops until then.
export function onRouterTransitionStart(url: string) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture("$pageview", { $current_url: url });
}
