export interface HydrationProduct {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: 'Hydration';
  price: number;
  bg: string;
  dark: string;
  light: string;
  image: string;
  amazonUrl: string;
}

export const hydrationProducts: HydrationProduct[] = [
  {
    id: 1,
    slug: 'blue-raspberry',
    name: 'Blue Raspberry',
    tagline: 'The original freeze.',
    description:
      'Bold blue raspberry flavour with Prime\u2019s hydration formula \u2014 built for athletes who want crisp taste without compromise. Refreshing, smooth, and ready for game day.',
    category: 'Hydration',
    price: 2.99,
    bg: '#0052CC',
    dark: '#001A72',
    light: '#66AAFF',
    image: '/images/hydration/blue-raspberry.svg',
    amazonUrl: 'https://www.amazon.com/Hydration-Muscle-Recovery-Raspberry-Drinks/dp/B09W363VTH?maas=maas_adg_78E76E7E4B7501578B4D7A3D76DA26C_afap_abs&ref_=aa_maas',
  },
  {
    id: 2,
    slug: 'lemon-lime',
    name: 'Lemon Lime',
    tagline: 'Zest for the game.',
    description:
      'Sharp lemon-lime balance with electrolytes and coconut water in every sip. Clean, citrus-forward hydration for training, travel, and everything in between.',
    category: 'Hydration',
    price: 2.99,
    bg: '#4D7C0F',
    dark: '#1A2E05',
    light: '#A3E635',
    image: '/images/hydration/lemon-lime.svg',
    amazonUrl: 'https://www.amazon.com/Prime-Hydration-Muscle-Recovery-Drinks/dp/B09W35HZRZ?maas=maas_adg_D5D52EBA500F8209FF34005545B90F47_afap_abs&ref_=aa_maas',
  },
  {
    id: 3,
    slug: 'lemonade',
    name: 'Lemonade',
    tagline: 'Classic cool, modernized.',
    description:
      'Sun-kissed lemonade taste backed by B vitamins, antioxidants, and electrolytes. A timeless flavour profile with Prime\u2019s modern performance blend.',
    category: 'Hydration',
    price: 2.99,
    bg: '#CA8A04',
    dark: '#1C1500',
    light: '#FDE68A',
    image: '/images/hydration/lemonade.svg',
    amazonUrl: 'https://www.amazon.com/PRIME-Hydration-LEMONADE-Electrolyte-Antioxidants/dp/B0C6FQRCZR?maas=maas_adg_61DFFE973150F2FF428417F7079CFF5D_afap_abs&ref_=aa_maas',
  },
  {
    id: 4,
    slug: 'strawberry-watermelon',
    name: 'Strawberry Watermelon',
    tagline: 'Summer in a can.',
    description:
      'Juicy strawberry and watermelon notes meet Prime hydration science. Sweet, bold, and made to keep you going through long sessions and hot days.',
    category: 'Hydration',
    price: 2.99,
    bg: '#E11D48',
    dark: '#4C0519',
    light: '#FCA5A5',
    image: '/images/hydration/strawberry-watermelon.svg',
    amazonUrl: 'https://www.amazon.com/PRIME-STRAWBERRY-WATERMELON-Electrolyte-Antioxidants/dp/B0C2JLSD6K?maas=maas_adg_5B86901C6FEDE11CD16978BDC2726060_afap_abs&ref_=aa_maas',
  },
  {
    id: 5,
    slug: 'tropical-punch',
    name: 'Tropical Punch',
    tagline: 'Taste the island.',
    description:
      'Tropical punch flavour with a vibrant finish and full-spectrum hydration support. Island-inspired taste with athlete-grade ingredients in every bottle.',
    category: 'Hydration',
    price: 2.99,
    bg: '#BE123C',
    dark: '#4C0519',
    light: '#FB7185',
    image: '/images/hydration/tropical-punch.svg',
    amazonUrl: 'https://www.amazon.com/Hydration-Muscle-Recovery-Tropical-Drinks/dp/B09W33L8SC?maas=maas_adg_62639B8424FF7A20ABE1B5821977AA14_afap_abs&ref_=aa_maas',
  },
  {
    id: 6,
    slug: 'ice-pop',
    name: 'Ice Pop',
    tagline: 'Arctic blast in a bottle.',
    description:
      'Ice-cold pop-inspired flavour with Prime\u2019s signature hydration stack. Crisp, refreshing, and formulated for recovery without caffeine or added sugar.',
    category: 'Hydration',
    price: 2.99,
    bg: '#0284C7',
    dark: '#082F49',
    light: '#7DD3FC',
    image: '/images/hydration/ice-pop.svg',
    amazonUrl: '',
  },
  {
    id: 7,
    slug: 'frostbite-fusion',
    name: 'Frostbite Fusion',
    tagline: 'Arctic cold meets tropical fire.',
    description:
      'A dual-temperature flavour experience \u2014 frosty upfront, tropical on the finish. Limited-edition energy with Prime hydration benefits in every pour.',
    category: 'Hydration',
    price: 2.99,
    bg: '#0EA5E9',
    dark: '#0C2340',
    light: '#7DD3FC',
    image: '/images/hydration/frostbite-fusion.svg',
    amazonUrl: '',
  },
];

export const hydrationBySlug = Object.fromEntries(
  hydrationProducts.map(p => [p.slug, p])
);
