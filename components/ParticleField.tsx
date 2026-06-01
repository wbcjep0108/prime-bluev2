'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  r: number;    // 0.4 – 1.4 px  — tiny, sharp
  a: number;    // 0.6 – 1.0     — bright
}

interface Props {
  density?: number;        // 0‥1   default 1.0
  magnetRadius?: number;   // px    default 280
  magnetStrength?: number; // 0‥1   default 0.42
}

export default function ParticleField({
  density        = 1.0,
  magnetRadius   = 280,
  magnetStrength = 0.42,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Willingness hint: no alpha compositing needed for screen blend
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    // ── DPR-crisp sizing ────────────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 3); // up to 3× for Retina
    let W = 0, H = 0, offX = 0, offY = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;   H = rect.height;
      offX = rect.left; offY = rect.top;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ── particles ───────────────────────────────────────────────────────────────
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // 1 particle per 3 200 px² at density=1, hard-cap at 550
    const count = Math.min(Math.round((W * H / 3_200) * density), 550);

    const particles: Particle[] = Array.from({ length: count }, () => {
      const ox = rand(0, W), oy = rand(0, H);
      return { x: ox, y: oy, ox, oy, vx: 0, vy: 0,
               r: rand(0.4, 1.4), a: rand(0.6, 1.0) };
    });

    // ── mouse — window level so no overlapping element can block it ─────────────
    const mouse = { x: -99999, y: -99999, active: false };
    const onMove  = (e: MouseEvent) => {
      mouse.x = e.clientX - offX;
      mouse.y = e.clientY - offY;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; mouse.x = mouse.y = -99999; };
    window.addEventListener('mousemove',  onMove,   { passive: true });
    window.addEventListener('mouseleave', onLeave,  { passive: true });

    // ── render loop ─────────────────────────────────────────────────────────────
    const MR2 = magnetRadius * magnetRadius;
    let raf   = 0;

    // Re-use a single path for all same-size dots where possible
    const tick = () => {
      ctx.clearRect(0, 0, W, H);

      // Batch: draw all particles in one path per alpha group is complex;
      // instead use a single fillStyle and vary only globalAlpha — still very fast
      ctx.fillStyle = '#ffffff';

      for (const p of particles) {
        // ── physics ────────────────────────────────────────────────────────────
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;

        if (mouse.active && d2 < MR2 && d2 > 0.01) {
          const dist  = Math.sqrt(d2);
          const t     = 1 - dist / magnetRadius; // 1 at cursor, 0 at edge
          p.vx += (dx / dist) * t * magnetStrength * 5;
          p.vy += (dy / dist) * t * magnetStrength * 5;
        }

        // Spring back to origin
        p.vx += (p.ox - p.x) * 0.025;
        p.vy += (p.oy - p.y) * 0.025;

        // Friction
        p.vx *= 0.80;
        p.vy *= 0.80;

        p.x += p.vx;
        p.y += p.vy;

        // ── draw: crisp solid circle — no gradient, no blur ────────────────────
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    // ── resize observer ─────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      resize();
      for (const p of particles) {
        p.ox = Math.min(p.ox, W);
        p.oy = Math.min(p.oy, H);
      }
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseleave', onLeave);
      ro.disconnect();
    };
  }, [density, magnetRadius, magnetStrength]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  );
}
