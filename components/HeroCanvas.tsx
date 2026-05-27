'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, useSpring } from 'framer-motion';

interface HeroCanvasProps {
  onProgress?: (progress: number) => void;
  onLoaded?: () => void;
}

export default function HeroCanvas({ onProgress, onLoaded }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001
  });

  const frameCount = 192;
  const bitmapsRef = useRef<ImageBitmap[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let loaded = 0;

    const allPromises = Array.from({ length: frameCount }, async (_, i) => {
      const paddedIndex = (i + 1).toString().padStart(3, '0');
      try {
        const res = await fetch(`/images/sequence/ezgif-frame-${paddedIndex}.jpg`);
        const blob = await res.blob();
        const bitmap = await createImageBitmap(blob);
        if (!isCancelled) {
          bitmapsRef.current[i] = bitmap;
          loaded++;
          if (loaded % 16 === 0 || loaded === frameCount) {
            const pct = Math.round((loaded / frameCount) * 100);
            onProgress?.(pct);
          }
        }
      } catch (e) {}
    });

    Promise.all(allPromises).then(() => {
      if (!isCancelled) {
        setIsLoaded(true);
        onLoaded?.();
      }
    });

    return () => { isCancelled = true; };
  }, []);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let rect = canvas.getBoundingClientRect();
    let renderRequested = false;
    let lastRenderedFrame = -1;

    const render = (progress: number, force: boolean = false) => {
      const frameIndex = Math.min(
        frameCount - 1,
        Math.max(0, Math.floor(progress * frameCount))
      );

      if (frameIndex === lastRenderedFrame && !force) {
        renderRequested = false;
        return;
      }
      lastRenderedFrame = frameIndex;

      const img = bitmapsRef.current[frameIndex];
      if (img) {
        const dpr = 1;
        
        if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
          canvas.width = Math.floor(rect.width * dpr);
          canvas.height = Math.floor(rect.height * dpr);
          ctx.scale(dpr, dpr);
        }

        const hRatio = rect.width / img.width;
        const vRatio = rect.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (rect.width - img.width * ratio) / 2;
        const centerShift_y = (rect.height - img.height * ratio) / 2;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#0066FF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.scale(dpr, dpr);
        ctx.drawImage(
          img,
          0, 0,
          img.width, img.height,
          centerShift_x, centerShift_y,
          img.width * ratio, img.height * ratio
        );
      }
      renderRequested = false;
    };

    render(smoothProgress.get(), true);

    const unsubscribe = smoothProgress.on('change', (latest) => {
      if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(() => render(latest));
      }
    });

    const handleResize = () => {
      rect = canvas.getBoundingClientRect();
      if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(() => render(smoothProgress.get(), true));
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded, smoothProgress]);

  return (
    <div ref={containerRef} className="relative w-full h-[800vh] z-10">
      <div className="sticky top-0 w-full h-[100vh] z-0 pointer-events-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
