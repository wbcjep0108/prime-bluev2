'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  ox: number;   // origin x
  oy: number;   // origin y
  vx: number;
  vy: number;
  r: number;
  a: number;    // base alpha
}

interface Props {
  /** Fraction of the viewport filled with particles — 0‥1  (default 0.5) */
  density?: number;
  /** Reach of the magnet attraction in px (default 180) */
  magnetRadius?: number;
  /** Pull strength 0‥1 (default 0.12) */
  magnetStrength?: number;
}

export default function ParticleField({
  density = 0.5,
  magnetRadius = 180,
  magnetStrength = 0.12,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // ── sizing ─────────────────────────────────────────────────────────────────
    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    // ── particles ──────────────────────────────────────────────────────────────
    // Target ~60 particles per 1000×700 viewport at density=1
    const targetCount = Math.round((W * H) / 11_000 * density);
    const count = Math.max(20, Math.min(targetCount, 200));

    const particles: Particle[] = [];
    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const spawn = (): Particle => {
      const ox = rand(0, W);
      const oy = rand(0, H);
      return {
        x: ox, y: oy,
        ox, oy,
        vx: rand(-0.12, 0.12),
        vy: rand(-0.12, 0.12),
        r: rand(0.6, 1.8),
        a: rand(0.25, 0.65),
      };
    };

    for (let i = 0; i < count; i++) particles.push(spawn());

    // ── mouse ──────────────────────────────────────────────────────────────────
    const mouse = { x: -9999, y: -9999 };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    canvas.addEventListener('mousemove', onMove, { passive: true });
    canvas.addEventListener('mouseleave', onLeave, { passive: true });

    // ── animation loop ─────────────────────────────────────────────────────────
    const MR2 = magnetRadius * magnetRadius;
    let raf = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        // Magnet attraction toward mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;

        if (d2 < MR2 && d2 > 0.01) {
          const inv = 1 - Math.sqrt(d2) / magnetRadius; // 0‥1, strong near mouse
          const force = inv * inv * magnetStrength;      // quadratic falloff
          p.vx += dx * force * 0.1;
          p.vy += dy * force * 0.1;
        }

        // Spring back to origin
        p.vx += (p.ox - p.x) * 0.018;
        p.vy += (p.oy - p.y) * 0.018;

        // Damping — keeps motion buttery without perpetual oscillation
        p.vx *= 0.88;
        p.vy *= 0.88;

        p.x += p.vx;
        p.y += p.vy;

        // Draw — single fillRect is faster than arc for small dots
        ctx.globalAlpha = p.a;
        ctx.fillStyle   = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    // ── resize observer ────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      resize();
      // Clamp existing origins to new size
      for (const p of particles) {
        p.ox = Math.min(p.ox, W);
        p.oy = Math.min(p.oy, H);
      }
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      ro.disconnect();
    };
  }, [density, magnetRadius, magnetStrength]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto z-0"
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  );
}
