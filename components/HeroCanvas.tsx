'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, useSpring } from 'framer-motion';

interface HeroCanvasProps {
  onProgress?: (progress: number) => void;
  onLoaded?: () => void;
}

const frameCount = 192;
// On mobile: load every 2nd frame to halve memory pressure
const isMobile = () =>
  typeof navigator !== 'undefined' &&
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
    restDelta: 0.001,
  });

  const bitmapsRef = useRef<(ImageBitmap | null)[]>(new Array(frameCount).fill(null));
  const [isLoaded, setIsLoaded] = useState(false);
  const mountedRef = useRef(true);
  const rafRef = useRef<number>(0);

  // ── Frame loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    const step = isMobile() ? 2 : 1; // halve frame count on mobile
    let loaded = 0;

    // Build list of frame indices to actually load
    const indices: number[] = [];
    for (let i = 0; i < frameCount; i += step) indices.push(i);
    const total = indices.length;

    // Fetch in small concurrent batches to avoid flooding mobile network
    const BATCH = 8;
    let batchStart = 0;

    const loadNext = async () => {
      if (!mountedRef.current) return;
      const batch = indices.slice(batchStart, batchStart + BATCH);
      batchStart += BATCH;
      if (batch.length === 0) return;

      await Promise.all(
        batch.map(async (i) => {
          const padded = (i + 1).toString().padStart(3, '0');
          try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const baseUrl = cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload` : '';
            const imgUrl = cloudName ? `${baseUrl}/images/sequence/ezgif-frame-${padded}.jpg` : `/images/sequence/ezgif-frame-${padded}.jpg`;
            const res = await fetch(imgUrl);
            if (!mountedRef.current) return;
            const blob = await res.blob();
            const bm = await createImageBitmap(blob);
            if (!mountedRef.current) {
              bm.close();
              return;
            }
            bitmapsRef.current[i] = bm;
            // Fill skipped neighbour so frame lookup always finds something
            if (step === 2 && i + 1 < frameCount) {
              bitmapsRef.current[i + 1] = bm;
            }
          } catch {
            // Ignore network errors — frame stays null, canvas skips it
          }
          loaded++;
          if (loaded % 16 === 0 || loaded === total) {
            onProgress?.(Math.round((loaded / total) * 100));
          }
        })
      );

      if (!mountedRef.current) return;

      if (batchStart < indices.length) {
        loadNext(); // load next batch
      } else {
        setIsLoaded(true);
        onLoaded?.();
      }
    };

    loadNext();

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
      // Close all bitmaps to free GPU memory
      bitmapsRef.current.forEach((bm) => {
        if (bm) {
          try { bm.close(); } catch { /* already closed */ }
        }
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Canvas render — Optimized for 60fps scrolling ──────────────────────────
  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let rect = canvas.getBoundingClientRect();
    let renderRequested = false;
    let lastRenderedFrame = -1;
    let latestProgress = smoothProgress.get();

    const render = (progress: number, force = false) => {
      if (!mountedRef.current) return;

      const frameIndex = Math.min(frameCount - 1, Math.max(0, Math.floor(progress * frameCount)));
      if (frameIndex === lastRenderedFrame && !force) {
        renderRequested = false;
        return;
      }
      lastRenderedFrame = frameIndex;

      const img = bitmapsRef.current[frameIndex];
      if (img) {
        const dpr = 1;

        if (
          canvas.width !== Math.floor(rect.width * dpr) ||
          canvas.height !== Math.floor(rect.height * dpr)
        ) {
          canvas.width = Math.floor(rect.width * dpr);
          canvas.height = Math.floor(rect.height * dpr);
        }

        const hRatio = rect.width / img.width;
        const vRatio = rect.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (rect.width - img.width * ratio) / 2;
        const centerShift_y = (rect.height - img.height * ratio) / 2;

        // Set scaling and reset transform in a single call, avoiding separate .scale() overhead
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        // JPEG images are drawn in cover mode (completely covering the canvas),
        // so we skip the redundant blue fillRect to prevent overdraw and maximize scroll frame rate.
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

    render(latestProgress, true);

    const unsubscribe = smoothProgress.on('change', (latest) => {
      latestProgress = latest;
      if (!renderRequested) {
        renderRequested = true;
        rafRef.current = requestAnimationFrame(() => render(latestProgress));
      }
    });

    const handleResize = () => {
      rect = canvas.getBoundingClientRect();
      if (!renderRequested) {
        renderRequested = true;
        rafRef.current = requestAnimationFrame(() => render(latestProgress, true));
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isLoaded, smoothProgress]);

  return (
    <div ref={containerRef} className="relative w-full z-10" style={{ height: '800vh' }}>
      <div className="sticky top-0 w-full z-0 pointer-events-none" style={{ height: '100vh' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{
            transform: 'translate3d(0,0,0)',
            willChange: 'transform',
          }}
        />
      </div>
    </div>
  );
}
