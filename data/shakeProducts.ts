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
}

export const shakeProducts: ShakeProduct[] = [
  {
    id: 201, // 200 series for Shake
    slug: 'chocolate',
    name: 'Chocolate',
    tagline: 'Rich, smooth, classic.',
    category: 'Shake',
    price: 3.99,
    bg: '#451A03', // Dark brown
    dark: '#270F02',
    light: '#78350F',
    image: '/images/shake/chocolate.webp',
  },
  {
    id: 202,
    slug: 'vanilla',
    name: 'Vanilla',
    tagline: 'Pure and creamy.',
    category: 'Shake',
    price: 3.99,
    bg: '#FEF3C7', // Vanilla cream
    dark: '#B45309',
    light: '#FFFBEB',
    image: '/images/shake/vanilla.webp',
  },
  {
    id: 203,
    slug: 'cookies-and-cream',
    name: 'Cookies and Cream',
    tagline: 'The best of both worlds.',
    category: 'Shake',
    price: 3.99,
    bg: '#1F2937', // Cookie dark
    dark: '#030712',
    light: '#F3F4F6', // Cream light
    image: '/images/shake/cookies-and-cream.webp',
  },
];
