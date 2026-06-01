'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroller() {
  useEffect(() => {
    // Disable browser scroll restoration to force start at top
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      autoRaf: true, // Let Lenis handle requestAnimationFrame automatically if available
    });
    lenis.scrollTo(0, { immediate: true });

    let scrollTimeout: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      document.body.classList.add('is-scrolling');
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 150);
    };

    lenis.on('scroll', handleScroll);

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      lenis.off('scroll', handleScroll);
      lenis.destroy();
      document.body.classList.remove('is-scrolling');
    };
  }, []);

  return null;
}
