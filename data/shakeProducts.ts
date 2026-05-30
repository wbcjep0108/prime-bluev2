export interface ShakeProduct {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  category: 'Shake';
  price: number;
  bg: string;
  dark: string;
  light: string;
  image: string;
  amazonUrl: string;
}

export const shakeProducts: ShakeProduct[] = [
  {
    id: 201,
    slug: 'chocolate',
    name: 'Chocolate',
    tagline: 'Rich, smooth, classic.',
    category: 'Shake',
    price: 3.99,
    bg: '#451A03',
    dark: '#270F02',
    light: '#78350F',
    image: '/images/shake/chocolate.webp',
    amazonUrl: 'https://www.amazon.com/PRIME-Protein-Chocolate-Recovery-Ultra-Filtered/dp/B0G7MSWYF7/ref=sr_1_4?sr=8-4',
  },
  {
    id: 202,
    slug: 'vanilla',
    name: 'Vanilla',
    tagline: 'Pure and creamy.',
    category: 'Shake',
    price: 3.99,
    bg: '#FEF3C7',
    dark: '#B45309',
    light: '#FFFBEB',
    image: '/images/shake/vanilla.webp',
    amazonUrl: 'https://www.amazon.com/PRIME-Protein-Vanilla-Recovery-Ultra-Filtered/dp/B0G7MC7TWC?ref_=ast_sto_dp',
  },
  {
    id: 203,
    slug: 'cookies-and-cream',
    name: 'Cookies and Cream',
    tagline: 'The best of both worlds.',
    category: 'Shake',
    price: 3.99,
    bg: '#1F2937',
    dark: '#030712',
    light: '#F3F4F6',
    image: '/images/shake/cookies-and-cream.webp',
    amazonUrl: 'https://www.amazon.com/PRIME-Protein-Cookies-Recovery-Ultra-Filtered/dp/B0G7MX5FHZ/ref=sr_1_6?sr=8-6',
  },
];
