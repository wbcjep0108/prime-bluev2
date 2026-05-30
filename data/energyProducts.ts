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
  amazonUrl: string;
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
    amazonUrl: 'https://www.amazon.com/PRIME-STRAWBERRY-LEMONADE-Electrolytes-Hydration/dp/B0G54D95VX/ref=sr_1_1?sr=8-1',
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
    amazonUrl: 'https://www.amazon.com/dp/B0FK6BSKWD?maas=maas_adg_7B30962A2323E36AE53FF2EBF84FF448_afap_abs&ref_=aa_maas',
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
    amazonUrl: 'https://www.amazon.com/PRIME-LIMEADE-Caffeine-Electrolytes-Hydration/dp/B0DQ6R3VX5?maas=maas_adg_1AD3F899ABA9CE26DC36DE0544409A79_afap_abs&ref_=aa_maas',
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
    amazonUrl: 'https://www.amazon.com/PRIME-DRIPSCICLE-Caffeine-Electrolytes-Hydration/dp/B0DQ6SHFRX?maas=maas_adg_1F630A4C75369ADBAC25516300278099_afap_abs&ref_=aa_maas',
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
    amazonUrl: 'https://www.amazon.com/PRIME-DREAMPOP-Caffeine-Electrolytes-Hydration/dp/B0DQ6VLG58?maas=maas_adg_DA83B3B860F9C389D5348B58E8762CCB_afap_abs&ref_=aa_maas',
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
    amazonUrl: 'https://www.amazon.com/PRIME-ORIGINAL-Caffeine-Electrolytes-Hydration/dp/B0DQ6QZP7Q?maas=maas_adg_DD84B7F6D0A35E02E42CF4E626A88944_afap_abs&ref_=aa_maas',
  },
];
