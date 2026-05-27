import type { Metadata } from 'next';
import { Geist, Bebas_Neue } from 'next/font/google';
import './globals.css';
import SmoothScroller from '../components/SmoothScroller';
import TransitionProvider from '../components/TransitionProvider';
import CustomCursor from '../components/CustomCursor';
import ScrollProgressIndicator from '../components/ScrollProgressIndicator';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' });

export const metadata: Metadata = {
  title: 'Prime Blue Raspberry | Scrollytelling',
  description: 'The Ultimate Freeze. Hydrate Now.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${bebas.variable}`}>
      <body className="font-sans antialiased text-white no-scrollbar bg-primeBlue relative">
        {/* Global Haptic Noise Film Grain Overlay */}
        <div 
          className="fixed inset-0 pointer-events-none z-50 opacity-[0.022] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
        
        <SmoothScroller />
        <TransitionProvider>
          <CustomCursor />
          <ScrollProgressIndicator />
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}

