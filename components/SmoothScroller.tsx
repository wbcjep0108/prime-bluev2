'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroller() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true, // Let Lenis handle requestAnimationFrame automatically if available
    });

    // We can also manually call raf if autoRaf is not available in this version:
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
