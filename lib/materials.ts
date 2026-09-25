// Product `materials` is free text written per product, so it says useful,
// specific things — "Food-grade silicone", "Natural hide drumhead",
// "Untreated sustainable wood". That detail belongs on the product page and
// is deliberately left alone.
//
// It makes a terrible filter, though: the catalogue carries 56 distinct
// strings and half of them appear on exactly one product, so the shop's
// Material facet listed dozens of dead ends. This maps each raw value onto a
// small set of groups used *only* for filtering. Display still shows the
// original text.

export const MATERIAL_GROUPS = [
  "Wood",
  "Metal",
  "Plastic",
  "Silicone",
  "Plush",
  "Cotton",
  "Textile",
  "Felt",
  "Cardboard",
  "Rubber",
] as const;

export type MaterialGroup = (typeof MATERIAL_GROUPS)[number];

// Ordered: the first pattern that matches wins, so put the more specific
// material ahead of the more general one it contains ("wool felt" before
// "wool", "silicone ring" before "ring").
const RULES: [RegExp, MaterialGroup][] = [
  [/felt/i, "Felt"],
  [/silicone/i, "Silicone"],
  [/plush|teddy|velour|foam/i, "Plush"],
  [/cotton/i, "Cotton"],
  [/cardboard|suitcase card|paper/i, "Cardboard"],
  [/rubber/i, "Rubber"],
  [/wood|beech|maple|cork|plywood/i, "Wood"],
  [/metal|steel|tin\b|brass|aluminium/i, "Metal"],
  [/plastic|acrylic|perspex/i, "Plastic"],
  [/textile|fabric|sisal|cord|hide|canvas|wool/i, "Textile"],
];

/** The filter group a raw material string belongs to, or null if it is a
 *  component description rather than a material ("Internal music box"). */
export function materialGroup(raw: string): MaterialGroup | null {
  for (const [pattern, group] of RULES) {
    if (pattern.test(raw)) return group;
  }
  return null;
}

/** Filter groups a product belongs to, deduplicated. */
export function productMaterialGroups(materials: string[]): MaterialGroup[] {
  const groups = new Set<MaterialGroup>();
  for (const m of materials) {
    const g = materialGroup(m);
    if (g) groups.add(g);
  }
  return [...groups];
}
