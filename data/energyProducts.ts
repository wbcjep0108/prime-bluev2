export interface EnergyProduct {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  category: 'Energy';
  price: number;
  bg: string;
  dark: string;
  light: string;
  image: string;
}

export const energyProducts: EnergyProduct[] = [
  {
    id: 101,
    slug: 'strawberry-lemonade',
    name: 'Strawberry Lemonade',
    tagline: 'Electric summer energy.',
    category: 'Energy',
    price: 3.49,
    bg: '#E11D48',
    dark: '#4C0519',
    light: '#FDA4AF',
    image: '/images/energy/strawberry-lemonade.webp',
  },
  {
    id: 102,
    slug: 'peso-pluma',
    name: 'Peso Pluma',
    tagline: 'Energ\u00eda pura.',
    category: 'Energy',
    price: 3.49,
    bg: '#D97706',
    dark: '#451A03',
    light: '#FCD34D',
    image: '/images/energy/peso-pluma.webp',
  },
  {
    id: 103,
    slug: 'cherry-limeade',
    name: 'Cherry Limeade',
    tagline: 'Sweet, sour, unstoppable.',
    category: 'Energy',
    price: 3.49,
    bg: '#BE123C',
    dark: '#4C0519',
    light: '#FDA4AF',
    image: '/images/energy/cherry-limeade.webp',
  },
  {
    id: 104,
    slug: 'dripsicle',
    name: 'Dripsicle',
    tagline: 'Orange cream overdrive.',
    category: 'Energy',
    price: 3.49,
    bg: '#EA580C',
    dark: '#431407',
    light: '#FDBA74',
    image: '/images/energy/dripsicle.webp',
  },
  {
    id: 105,
    slug: 'dream-pop',
    name: 'Dream Pop',
    tagline: 'Liquid imagination.',
    category: 'Energy',
    price: 3.49,
    bg: '#C026D3',
    dark: '#4A044E',
    light: '#F0ABFC',
    image: '/images/energy/dream-pop.webp',
  },
  {
    id: 106,
    slug: 'original',
    name: 'Original',
    tagline: 'The pure boost.',
    category: 'Energy',
    price: 3.49,
    bg: '#0052CC',
    dark: '#001A72',
    light: '#66AAFF',
    image: '/images/energy/original.webp',
  },
];
