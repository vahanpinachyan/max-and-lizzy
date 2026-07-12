// Generates branded SVG placeholder images for products, categories, blog
// covers, and store photos. Run with: node scripts/generate-placeholder-images.mjs
// Replace these with real photography before launch — see README.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public", "images");

const PALETTE = {
  cream: "#fbf6ee",
  beige: "#f2e5d2",
  tan: "#ddc4a0",
  wood: "#a97247",
  woodDark: "#7c4f2e",
  espresso: "#3d2b1f",
  sage: "#7c9473",
  terracotta: "#d97a4d",
};

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// A small set of simple decorative icon shapes drawn with primitives,
// keyed by category/theme so each placeholder feels distinct.
const ICONS = {
  block: (cx, cy, c) => `
    <g>
      <rect x="${cx - 60}" y="${cy - 20}" width="50" height="50" rx="8" fill="${c.terracotta}" transform="rotate(-8 ${cx - 35} ${cy + 5})"/>
      <rect x="${cx - 10}" y="${cy - 40}" width="50" height="50" rx="8" fill="${c.sage}" transform="rotate(6 ${cx + 15} ${cy - 15})"/>
      <rect x="${cx + 20}" y="${cy - 5}" width="50" height="50" rx="8" fill="${c.wood}" transform="rotate(-4 ${cx + 45} ${cy + 20})"/>
    </g>`,
  arch: (cx, cy, c) => `
    <g fill="none" stroke-linecap="round">
      <path d="M ${cx - 70} ${cy + 40} A 70 70 0 0 1 ${cx + 70} ${cy + 40}" stroke="${c.terracotta}" stroke-width="18"/>
      <path d="M ${cx - 50} ${cy + 40} A 50 50 0 0 1 ${cx + 50} ${cy + 40}" stroke="${c.sage}" stroke-width="16"/>
      <path d="M ${cx - 30} ${cy + 40} A 30 30 0 0 1 ${cx + 30} ${cy + 40}" stroke="${c.wood}" stroke-width="14"/>
    </g>`,
  puzzle: (cx, cy, c) => `
    <g fill="${c.terracotta}">
      <rect x="${cx - 55}" y="${cy - 55}" width="50" height="50" rx="6"/>
      <rect x="${cx + 5}" y="${cx - 55}" width="0" height="0"/>
    </g>
    <g fill="${c.sage}">
      <rect x="${cx + 5}" y="${cy - 55}" width="50" height="50" rx="6"/>
    </g>
    <g fill="${c.wood}">
      <rect x="${cx - 55}" y="${cy + 5}" width="50" height="50" rx="6"/>
    </g>
    <g fill="${c.woodDark}">
      <rect x="${cx + 5}" y="${cy + 5}" width="50" height="50" rx="6"/>
    </g>`,
  bike: (cx, cy, c) => `
    <g fill="none" stroke="${c.wood}" stroke-width="10" stroke-linecap="round">
      <circle cx="${cx - 55}" cy="${cy + 45}" r="34" stroke="${c.woodDark}"/>
      <circle cx="${cx + 55}" cy="${cy + 45}" r="34" stroke="${c.woodDark}"/>
      <path d="M ${cx - 55} ${cy + 45} L ${cx} ${cy - 10} L ${cx + 55} ${cy + 45}" stroke="${c.terracotta}"/>
      <path d="M ${cx - 20} ${cy - 10} L ${cx} ${cy + 45}" stroke="${c.terracotta}"/>
    </g>`,
  leaf: (cx, cy, c) => `
    <g fill="${c.sage}">
      <path d="M ${cx} ${cy - 55} C ${cx + 60} ${cy - 55} ${cx + 60} ${cy + 55} ${cx} ${cy + 55} C ${cx - 60} ${cy + 55} ${cx - 60} ${cy - 55} ${cx} ${cy - 55} Z"/>
    </g>
    <path d="M ${cx} ${cy - 45} L ${cx} ${cy + 45}" stroke="${c.sageDark || "#5f7857"}" stroke-width="4" fill="none"/>`,
  bear: (cx, cy, c) => `
    <g fill="${c.terracotta}">
      <circle cx="${cx}" cy="${cy}" r="55"/>
      <circle cx="${cx - 48}" cy="${cy - 40}" r="20"/>
      <circle cx="${cx + 48}" cy="${cy - 40}" r="20"/>
    </g>
    <g fill="${c.cream}">
      <circle cx="${cx - 18}" cy="${cy - 8}" r="6"/>
      <circle cx="${cx + 18}" cy="${cy - 8}" r="6"/>
      <ellipse cx="${cx}" cy="${cy + 15}" rx="14" ry="10"/>
    </g>`,
  music: (cx, cy, c) => `
    <g fill="${c.wood}">
      <rect x="${cx - 70}" y="${cy + 10}" width="140" height="20" rx="4"/>
      <rect x="${cx - 70}" y="${cy - 20}" width="20" height="60" rx="4" fill="${c.terracotta}"/>
      <rect x="${cx - 35}" y="${cy - 35}" width="20" height="75" rx="4" fill="${c.sage}"/>
      <rect x="${cx}" y="${cy - 45}" width="20" height="85" rx="4" fill="${c.terracotta}"/>
      <rect x="${cx + 35}" y="${cy - 30}" width="20" height="70" rx="4" fill="${c.sage}"/>
    </g>`,
  wave: (cx, cy, c) => `
    <g fill="none" stroke="${c.sage}" stroke-width="16" stroke-linecap="round">
      <path d="M ${cx - 90} ${cy - 15} Q ${cx - 60} ${cy - 55} ${cx - 30} ${cy - 15} T ${cx + 30} ${cy - 15} T ${cx + 90} ${cy - 15}"/>
      <path d="M ${cx - 90} ${cy + 25} Q ${cx - 60} ${cy - 15} ${cx - 30} ${cy + 25} T ${cx + 30} ${cy + 25} T ${cx + 90} ${cy + 25}" stroke="${c.wood}"/>
    </g>`,
  storefront: (cx, cy, c) => `
    <g>
      <rect x="${cx - 90}" y="${cy - 10}" width="180" height="70" fill="${c.beige}" stroke="${c.woodDark}" stroke-width="4"/>
      <rect x="${cx - 90}" y="${cy - 40}" width="180" height="30" fill="${c.terracotta}"/>
      <rect x="${cx - 60}" y="${cy + 10}" width="35" height="50" fill="${c.cream}" stroke="${c.woodDark}" stroke-width="3"/>
      <rect x="${cx - 10}" y="${cy + 10}" width="35" height="50" fill="${c.cream}" stroke="${c.woodDark}" stroke-width="3"/>
      <rect x="${cx + 40}" y="${cy + 10}" width="35" height="50" fill="${c.cream}" stroke="${c.woodDark}" stroke-width="3"/>
    </g>`,
};

function iconFor(seed) {
  const keys = Object.keys(ICONS);
  const hash = [...seed].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return ICONS[keys[hash % keys.length]];
}

// No baked-in title text: every real usage site (product cards, category
// tiles, blog covers, promo banners, etc.) already renders the real name/
// title as actual HTML next to the image. Baking a second copy of that text
// into the placeholder art just duplicates it — worse, since object-cover
// crops differently per breakpoint, that baked-in text can become visible
// at aspect ratios where it wasn't meant to show, creating an apparent
// duplicate-text bug. The `role="img"` + `aria-label` below still gives it
// an accessible name.
function placeholderSvg({ width = 800, height = 800, label, iconKey, seed = label }) {
  const c = PALETTE;
  const iconFn = iconKey ? ICONS[iconKey] : iconFor(seed);
  const cx = width / 2;
  const cy = height / 2;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(label)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.beige}"/>
      <stop offset="100%" stop-color="${c.tan}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect x="14" y="14" width="${width - 28}" height="${height - 28}" fill="none" stroke="${c.woodDark}" stroke-width="4" stroke-dasharray="2 14" stroke-linecap="round" opacity="0.4"/>
  ${iconFn(cx, cy, c)}
</svg>`;
}

function write(relPath, svg) {
  const full = path.join(publicDir, relPath);
  ensureDir(path.dirname(full));
  writeFileSync(full, svg, "utf-8");
  console.log("wrote", relPath);
}

// ---- Products ----
const products = JSON.parse(
  readFileSync(path.join(__dirname, "product-image-manifest.json"), "utf-8")
);

for (const p of products) {
  p.images.forEach((img, idx) => {
    write(
      `products/${p.slug}-${idx + 1}.svg`,
      placeholderSvg({ label: p.name, seed: p.slug + idx })
    );
  });
}

// ---- Categories ----
const categoryIcons = {
  educational: "puzzle",
  "wooden-toys": "block",
  "outdoor-play": "bike",
  "puzzles-games": "puzzle",
  "baby-toddler": "bear",
};
for (const [slug, name] of Object.entries({
  educational: "Educational Toys",
  "wooden-toys": "Wooden Toys",
  "outdoor-play": "Outdoor Play",
  "puzzles-games": "Puzzles & Games",
  "baby-toddler": "Baby & Toddler",
})) {
  write(
    `categories/${slug}.svg`,
    placeholderSvg({ label: name, iconKey: categoryIcons[slug], width: 900, height: 700 })
  );
}

// ---- Blog covers ----
const blogCovers = {
  "gift-guide-1-year-olds": "Best Wooden Toys for 1-Year-Olds",
  "why-wooden-toys": "Why Wooden Toys?",
  "screen-free-gift-guide": "Screen-Free Gift Guide",
  "age-appropriate-toys-checklist": "Age-Appropriate Toys Checklist",
};
for (const [file, label] of Object.entries(blogCovers)) {
  write(`blog/${file}.svg`, placeholderSvg({ label, width: 1200, height: 630 }));
}

// ---- Hero & misc ----
write(
  "hero-home.svg",
  placeholderSvg({ label: "Max & Lizzy — Educational Wooden Toys", iconKey: "arch", width: 1600, height: 1000 })
);
write("logo.svg", placeholderSvg({ label: "Max & Lizzy", iconKey: "bear", width: 400, height: 400 }));
write("about-founders.svg", placeholderSvg({ label: "Our Founders", iconKey: "leaf", width: 900, height: 700 }));
write("about-story.svg", placeholderSvg({ label: "Our Story", iconKey: "block", width: 900, height: 700 }));

// ---- Store photos ----
const storePhotos = ["storefront-exterior", "shop-interior", "toy-shelf-display", "checkout-counter"];
for (const name of storePhotos) {
  write(
    `store/${name}.svg`,
    placeholderSvg({ label: name.replace(/-/g, " "), iconKey: "storefront", width: 1000, height: 750 })
  );
}

// ---- Promotions (wide carousel banners) ----
const promoSlides = {
  "new-stem-arrivals": { label: "New: STEM Building Sets", icon: "puzzle" },
  "gift-guide-under-15000": { label: "Gifts Under 15,000 AMD", icon: "bear" },
  "outdoor-play-season": { label: "Ready for Outdoor Play", icon: "bike" },
  "visit-yerevan-store": { label: "Visit Us on Mashtots Avenue", icon: "storefront" },
};
for (const [file, { label, icon }] of Object.entries(promoSlides)) {
  write(
    `promotions/${file}.svg`,
    placeholderSvg({ label, iconKey: icon, width: 1600, height: 720 })
  );
}

// ---- Instagram feed (square placeholder posts) ----
const instagramPosts = [
  { file: "post-1", label: "Stacking arches in the shop window", icon: "arch" },
  { file: "post-2", label: "New wooden blocks just arrived", icon: "block" },
  { file: "post-3", label: "A little customer testing bikes", icon: "bike" },
  { file: "post-4", label: "Puzzle table on a Saturday morning", icon: "puzzle" },
  { file: "post-5", label: "Behind the scenes: sanding down edges", icon: "leaf" },
  { file: "post-6", label: "Weekend market pop-up stand", icon: "storefront" },
];
for (const { file, label, icon } of instagramPosts) {
  write(`instagram/${file}.svg`, placeholderSvg({ label, iconKey: icon, width: 800, height: 800 }));
}

console.log("Done generating placeholder images.");
