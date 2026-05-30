import { getCldImageUrl } from '../lib/cloudinary';

export const productData = {
  name: 'Prime Blue Raspberry',
  price: '',
  colors: {
    electricBlue: '#0066FF',
    deepBlue: '#001A72',
    white: '#FFFFFF',
  },
  staticAssets: {
    staticBottle: getCldImageUrl('/images/prime-bottle-static.png'),
    finalTagline: 'THE ULTIMATE FREEZE. HYDRATE NOW.',
  },
  specs: {
    coconutWater: '10%',
    electrolytes: '834mg',
    bcaas: '250mg',
    sugar: 'Zero',
  },
  storySections: [
    { title: 'The Blue Freeze.' },
    { title: 'Triple Flavor Energy.' },
    { title: 'Zero Sugar. Pure Fuel.' },
  ],
  postSequenceContent: {
    hydrationSpecs: [
      { label: 'Sodium', value: '10mg' },
      { label: 'Potassium', value: '700mg' },
      { label: 'Magnesium', value: '124mg' },
    ],
    athleteTested: 'Formulated to help athletes push past their limits with maximum hydration and performance benefits.',
  },
};
