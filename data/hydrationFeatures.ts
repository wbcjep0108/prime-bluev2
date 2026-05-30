/** Shared nutrition / benefit tags shown on every hydration PDP */
export const HYDRATION_MAIN_NOTES = [
  'Zero Added Sugar',
  '20 Calories',
  '10% Coconut Water',
  'BCAAs + B Vitamins',
  'Antioxidants + Electrolytes',
  'Caffeine-Free',
] as const;

export type HydrationImageView = 'front' | 'side' | 'back';

export const HYDRATION_IMAGE_VIEWS: { id: HydrationImageView; label: string }[] = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'back', label: 'Back' },
];

/** Paths under /public/images/hydration/{slug}/ */
export function getHydrationViewImage(slug: string, view: HydrationImageView) {
  return `/images/hydration/${slug}/${view}.webp`;
}
