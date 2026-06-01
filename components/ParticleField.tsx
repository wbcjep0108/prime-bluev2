'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  ox: number;   // resting origin
  oy: number;
  vx: number;
  vy: number;
  r: number;    // display radius (matches sprite scale)
  a: number;    // alpha 0‥1
}

interface Props {
  density?: number;        // 0‥1   default 0.9
  magnetRadius?: number;   // px    default 300
  magnetStrength?: number; // 0‥1   default 0.45
}

// ── Pre-bake a single white-glow sprite (done once, re-used every draw) ────────
function makeSprite(size: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const cx = c.getContext('2d')!;
  const half = size / 2;
  const gr = cx.createRadialGradient(half, half, 0, half, half, half);
  gr.addColorStop(0,   'rgba(255,255,255,1)');
  gr.addColorStop(0.3, 'rgba(255,255,255,0.85)');
  gr.addColorStop(0.7, 'rgba(255,255,255,0.25)');
  gr.addColorStop(1,   'rgba(255,255,255,0)');
  cx.fillStyle = gr;
  cx.fillRect(0, 0, size, size);
  return c;
}

export default function ParticleField({
  density        = 0.9,
  magnetRadius   = 300,
  magnetStrength = 0.45,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // ── sizing ──────────────────────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, offX = 0, offY = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      offX = rect.left;
      offY = rect.top;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ── sprite — one allocation, used for every particle every frame ────────────
    const SPRITE_SIZE = 48; // px — baked halo diameter
    const sprite = makeSprite(SPRITE_SIZE);
    const half = SPRITE_SIZE / 2;

    // ── particles ───────────────────────────────────────────────────────────────
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    // ~1 particle per 5 500 px² at density=1, hard cap 350
    const count = Math.min(Math.round((W * H / 5_500) * density), 350);

    const particles: Particle[] = Array.from({ length: count }, () => {
      const ox = rand(0, W);
      const oy = rand(0, H);
      return {
        x: ox, y: oy,
        ox, oy,
        vx: rand(-0.08, 0.08),
        vy: rand(-0.08, 0.08),
        r: rand(2, 5),
        a: rand(0.45, 0.95),
      };
    });

    // ── mouse — window listener, nothing can block it ───────────────────────────
    const mouse = { x: -99999, y: -99999, active: false };

    const onMove = (e: MouseEvent) => {
      mouse.x      = e.clientX - offX;
      mouse.y      = e.clientY - offY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x      = -99999;
      mouse.y      = -99999;
    };

    window.addEventListener('mousemove',  onMove,   { passive: true });
    window.addEventListener('mouseleave', onLeave,  { passive: true });

    // ── render loop ─────────────────────────────────────────────────────────────
    const MR  = magnetRadius;
    const MR2 = MR * MR;
    let raf   = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;

        if (mouse.active && d2 < MR2 && d2 > 0.01) {
          const dist  = Math.sqrt(d2);
          // Linear falloff: full strength at cursor, zero at edge.
          // Multiply by dist so far-away particles move less (natural feel).
          const t     = 1 - dist / MR;
          const force = t * magnetStrength;
          p.vx += (dx / dist) * force * 4.5;
          p.vy += (dy / dist) * force * 4.5;
        }

        // Spring back toward resting origin (fights the magnet when mouse is gone)
        p.vx += (p.ox - p.x) * 0.024;
        p.vy += (p.oy - p.y) * 0.024;

        // Friction — keeps velocity bounded, motion silky
        p.vx *= 0.82;
        p.vy *= 0.82;

        p.x += p.vx;
        p.y += p.vy;

        // Draw: drawImage from sprite — zero per-frame GPU allocation
        ctx.globalAlpha = p.a;
        const hw = p.r * (SPRITE_SIZE / 4); // scale sprite to particle radius
        ctx.drawImage(sprite, p.x - hw, p.y - hw, hw * 2, hw * 2);
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
      /* pointer-events-none so clicks pass through to content above */
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  );
}
