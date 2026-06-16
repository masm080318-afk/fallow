// FAO-56 Table 12 — single (mid-season) crop coefficients for common small-farm crops
export const CROP_TYPES = [
  { id: "garden",       label: "General garden bed",  kc: 1.00 },
  { id: "tomatoes",     label: "Tomatoes",            kc: 1.15 },
  { id: "leafy_greens", label: "Leafy greens (lettuce, spinach)", kc: 1.00 },
  { id: "peppers",      label: "Peppers",             kc: 1.05 },
  { id: "corn",         label: "Corn / maize",        kc: 1.20 },
] as const;

export type CropId = typeof CROP_TYPES[number]["id"];

export function getKc(cropId: string): number {
  return CROP_TYPES.find((c) => c.id === cropId)?.kc ?? 1.0;
}
