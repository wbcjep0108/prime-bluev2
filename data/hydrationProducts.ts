export interface HydrationProduct {
  id: number;
  slug: string;        // used for image filename
  name: string;
  tagline: string;
  description: string;
  category: 'Hydration';
  price: number;
  bg: string;          // primary card color
  dark: string;        // dark background tone
  light: string;       // accent / highlight color
  image: string;       // path under /public (shop grid thumbnail)
}

/** Shop catalog: all 5 original flavours + 2 additional hydration SKUs */
export const hydrationProducts: HydrationProduct[] = [
  {
    id: 1,
    slug: 'blue-raspberry',
    name: 'Blue Raspberry',
    tagline: 'The original freeze.',
    description:
      'Bold blue raspberry flavour with Prime’s hydration formula — built for athletes who want crisp taste without compromise. Refreshing, smooth, and ready for game day.',
    category: 'Hydration',
    price: 2.99,
    bg: '#0052CC',
    dark: '#001A72',
    light: '#66AAFF',
    image: '/images/hydration/blue-raspberry.svg',
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
  },
  {
    id: 3,
    slug: 'lemonade',
    name: 'Lemonade',
    tagline: 'Classic cool, modernized.',
    description:
      'Sun-kissed lemonade taste backed by B vitamins, antioxidants, and electrolytes. A timeless flavour profile with Prime’s modern performance blend.',
    category: 'Hydration',
    price: 2.99,
    bg: '#CA8A04',
    dark: '#1C1500',
    light: '#FDE68A',
    image: '/images/hydration/lemonade.svg',
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
  },
  {
    id: 6,
    slug: 'ice-pop',
    name: 'Ice Pop',
    tagline: 'Arctic blast in a bottle.',
    description:
      'Ice-cold pop-inspired flavour with Prime’s signature hydration stack. Crisp, refreshing, and formulated for recovery without caffeine or added sugar.',
    category: 'Hydration',
    price: 2.99,
    bg: '#0284C7',
    dark: '#082F49',
    light: '#7DD3FC',
    image: '/images/hydration/ice-pop.svg',
  },
  {
    id: 7,
    slug: 'frostbite-fusion',
    name: 'Frostbite Fusion',
    tagline: 'Arctic cold meets tropical fire.',
    description:
      'A dual-temperature flavour experience — frosty upfront, tropical on the finish. Limited-edition energy with Prime hydration benefits in every pour.',
    category: 'Hydration',
    price: 2.99,
    bg: '#0EA5E9',
    dark: '#0C2340',
    light: '#7DD3FC',
    image: '/images/hydration/frostbite-fusion.svg',
  },
];

// Lookup by slug for product detail pages
export const hydrationBySlug = Object.fromEntries(
  hydrationProducts.map(p => [p.slug, p])
);
