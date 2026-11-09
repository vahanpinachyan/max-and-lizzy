"use client";

// Last line of defence: this replaces the whole document when the root
// layout itself fails, so there is no I18nProvider to translate against and
// no guarantee the stylesheet loaded. Everything is inline and English, and
// the palette is hardcoded from globals.css so it still looks like the shop
// rather than a raw browser error page.
const CREAM = "#f7f2e6";
const ESPRESSO = "#3d2b1f";
const TERRACOTTA = "#b8552a";
const TAN = "#d9c4a0";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: CREAM,
          color: ESPRESSO,
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p style={{ fontSize: "3rem", margin: 0 }}>🧸</p>
          <h1 style={{ fontSize: "1.75rem", margin: "1.5rem 0 0" }}>Max &amp; Lizzy is having a moment</h1>
          <p style={{ margin: "1rem 0 0", lineHeight: 1.6, opacity: 0.75 }}>
            Something went wrong at our end and the page couldn&apos;t load. It isn&apos;t your
            connection. Please try again — the shop is still here.
          </p>
          <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: "none",
                borderRadius: "999px",
                background: TERRACOTTA,
                color: "#fff",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* A plain anchor on purpose: next/link would do a client-side
                navigation back into the React tree that just crashed. A full
                document load is the only thing that reliably recovers here. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                borderRadius: "999px",
                border: `1px solid ${TAN}`,
                color: ESPRESSO,
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go to the homepage
            </a>
          </div>
          {error.digest && (
            <p style={{ marginTop: "2rem", fontFamily: "monospace", fontSize: "0.75rem", opacity: 0.4 }}>
              #{error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
