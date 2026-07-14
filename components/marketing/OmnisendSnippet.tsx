import Script from "next/script";

// Omnisend on-site tracking (page views, product browsing) — unlocks
// browse-abandonment automations and richer segmentation in Omnisend beyond
// what the server-side contact/order sync (lib/omnisend.ts) already sends.
// Set NEXT_PUBLIC_OMNISEND_BRAND_ID in your environment (see .env.example)
// to enable — renders nothing until then. Find the brand ID in the Omnisend
// dashboard: hover the store icon in the left sidebar → "Your brand ID".
export function OmnisendSnippet() {
  const brandId = process.env.NEXT_PUBLIC_OMNISEND_BRAND_ID;
  if (!brandId) return null;

  return (
    <Script id="omnisend-snippet" strategy="afterInteractive">
      {`
        window.omnisend = window.omnisend || [];
        omnisend.push(["brandID", "${brandId}"]);
        omnisend.push(["track", "$pageViewed"]);
        !function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src="https://omnisnippet1.com/inshop/launcher-v2.js";var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t)}();
      `}
    </Script>
  );
}
