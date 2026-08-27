"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

let initialized = false;

// Initializes PostHog after hydration (a useEffect), not in
// instrumentation-client.ts's pre-hydration window. PostHog's session
// replay extension inserts a <script> into <head> as part of init(), and
// doing that before hydration finishes shifts sibling nodes and causes a
// React hydration mismatch (observed against components/seo/JsonLd.tsx's
// script tag). See instrumentation-client.ts for the pageview-on-navigation
// half, which doesn't have this problem since it only fires post-hydration.
export function PostHogInit() {
  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!posthogKey || initialized) return;
    initialized = true;

    posthog.init(posthogKey, {
      // Defaults to "/relay", proxied through next.config.ts's rewrites()
      // rather than talking to i.posthog.com directly (ad blockers that
      // filter known analytics domains don't touch first-party paths).
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
      // Since api_host is now this site's own domain, PostHog needs telling
      // separately where the real dashboard lives, for things like toolbar
      // links and feature-flag editor links to resolve correctly.
      ui_host: "https://eu.posthog.com",
      // Pageviews are captured manually — instrumentation-client.ts's
      // onRouterTransitionStart handles subsequent client-side navigations,
      // and the capture() call right below handles the very first page
      // load (onRouterTransitionStart only fires on *later* navigations).
      capture_pageview: false,
      // $pageleave isn't implied by capture_pageview:false — without this,
      // PostHog can't compute accurate bounce rate/session duration.
      capture_pageleave: true,
      // Only create a full PostHog "person" profile for visitors we
      // actually identify (e.g. a future post-checkout identify() call) —
      // anonymous browsing still generates events, just without a
      // persistent profile. Matches PostHog's own recommended default for
      // this project.
      person_profiles: "identified_only",
      session_recording: {
        // Session replay is on for this project — mask every input value
        // (not just password fields) so checkout form contents (name,
        // address, phone) never end up in a recording.
        maskAllInputs: true,
      },
    });
    posthog.capture("$pageview");
  }, []);

  return null;
}
