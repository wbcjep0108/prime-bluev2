/** Shared nutrition / benefit tags shown on every energy PDP */
export const ENERGY_MAIN_NOTES = [
  'Zero Sugar',
  '200mg Caffeine',
  '355mg Electrolytes',
  'Vegan',
  'For Ages 18+',
  'New 16oz Size',
] as const;

export type EnergyImageView = 'front' | 'side' | 'back';

export const ENERGY_IMAGE_VIEWS: { id: EnergyImageView; label: string }[] = [
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'back', label: 'Back' },
];

/** Paths under /public/images/energy/{slug}/ */
export function getEnergyViewImage(slug: string, view: EnergyImageView) {
  return `/images/energy/${slug}/${view}.webp`;
}
