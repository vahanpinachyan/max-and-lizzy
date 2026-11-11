import ReactDOM from "react-dom";

// next/font used to emit <link rel="preload"> for the subsets it was told to
// load. Vendored faces get no such thing for free, and without it the first
// paint shows the metric-matched fallback and swaps a beat later.
//
// Only the faces a given visitor will certainly use are preloaded: the body
// and heading face for their own script. Preloading all of them would pull
// Armenian down for an English reader and vice versa — the unicode-range on
// each face already keeps the rest from being fetched at all.
//
// ReactDOM.preload rather than a literal <link>: React hoists its own copy of
// a rendered preload link into <head> as well, so writing the tag by hand
// emits each font twice.
const PRELOADS: Record<string, readonly string[]> = {
  hy: ["noto-sans-armenian-armenian-wght-normal", "noto-serif-armenian-armenian-wght-normal"],
  ru: ["golos-text-cyrillic-wght-normal", "bitter-cyrillic-wght-normal"],
  en: ["golos-text-latin-wght-normal", "bitter-latin-wght-normal"],
};

export function FontPreloads({ locale }: { locale: string }) {
  for (const file of PRELOADS[locale] ?? PRELOADS.en) {
    ReactDOM.preload(`/fonts/${file}.woff2`, {
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    });
  }
  return null;
}
