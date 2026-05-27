/** Shared nutrition / benefit tags shown on every shake PDP */
export const SHAKE_MAIN_NOTES = [
  "32g PROTEIN per serving",
  "LACTOSE-FREE",
  "ULTRA-FILTERED MILK",
  "150 CALORIES per serving",
  "2G SUGAR per serving",
] as const;

export type ShakeImageView = "front" | "side" | "back";

export const SHAKE_IMAGE_VIEWS: { id: ShakeImageView; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "back", label: "Back" },
];

/** Placeholder paths - replace with real assets under /public/images/shake/{slug}/ */
export function getShakeViewImage(slug: string, view: ShakeImageView) {
  return `/images/shake/${slug}/${view}.webp`;
}
