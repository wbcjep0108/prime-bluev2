'use client';

import { useState, useEffect, useRef } from 'react';
import HeroCanvas from '../components/HeroCanvas';
import TextOverlays from '../components/TextOverlays';
import PrimeAbout from '../components/PrimeAbout';
import StackedCards from '../components/StackedCards';
import Navbar from '../components/Navbar';
import PostSequenceContent from '../components/PostSequenceContent';
import MarqueeSection from '../components/MarqueeSection';
import ProductCarousel from '../components/ProductCarousel';
import ScrollRevealSection from '../components/ScrollRevealSection';
import VideoBento from '../components/VideoBento';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';

export default function Home() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  // Shared ref for the 800vh hero zone — TextOverlays targets this
  // so overlays are confined strictly to the hero scroll range.
  const heroZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen w-full relative bg-primeBlue">
      <LoadingScreen progress={loadProgress} isLoaded={isLoaded} />

      <Navbar />

      {/* Hero zone — 800vh canvas + fixed text overlays confined here */}
      <div ref={heroZoneRef}>
        <HeroCanvas
          onProgress={setLoadProgress}
          onLoaded={() => setIsLoaded(true)}
        />
      </div>
      <TextOverlays isLoaded={isLoaded} heroRef={heroZoneRef} />

      {/* About Prime — statement panel */}
      <PrimeAbout />

      {/* Stacked cards — scroll-driven pile-up */}
      <StackedCards />

      {/* Marquee scroll-driven banner (horizontalscroll) */}
      <MarqueeSection />

      {/* Video bento — synchronized split player */}
      <VideoBento />

      {/* Scroll reveal — clip-from-left editorial text */}
      <ScrollRevealSection />

      {/* Horizontal product carousel (carouselcard) */}
      <ProductCarousel />

      <PostSequenceContent />

      <Footer />
    </main>
  );
}
