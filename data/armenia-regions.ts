export interface ArmeniaRegion {
  id: string;
  label: string;
}

// The 10 marzes of Armenia outside Yerevan — used for the "delivery outside
// Yerevan" region picker (Yerevan itself has its own dedicated fulfillment
// option, so it's intentionally excluded here).
export const ARMENIA_REGIONS: ArmeniaRegion[] = [
  { id: "aragatsotn", label: "Aragatsotn" },
  { id: "ararat", label: "Ararat" },
  { id: "armavir", label: "Armavir" },
  { id: "gegharkunik", label: "Gegharkunik" },
  { id: "kotayk", label: "Kotayk" },
  { id: "lori", label: "Lori" },
  { id: "shirak", label: "Shirak" },
  { id: "syunik", label: "Syunik" },
  { id: "tavush", label: "Tavush" },
  { id: "vayots_dzor", label: "Vayots Dzor" },
];
