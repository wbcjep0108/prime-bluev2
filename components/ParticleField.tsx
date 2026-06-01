'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  ox: number;   // resting origin x
  oy: number;   // resting origin y
  vx: number;
  vy: number;
  r: number;    // radius
  a: number;    // alpha
}

interface Props {
  density?: number;        // 0‥1 — fraction of max particles  (default 0.8)
  magnetRadius?: number;   // px — attraction zone             (default 250)
  magnetStrength?: number; // 0‥1 — pull force                (default 0.28)
}

export default function ParticleField({
  density = 0.8,
  magnetRadius = 250,
  magnetStrength = 0.28,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // ── DPR-aware sizing ────────────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, offX = 0, offY = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W    = rect.width;
      H    = rect.height;
      offX = rect.left;
      offY = rect.top;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ── spawn particles ─────────────────────────────────────────────────────────
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    // ~1 particle per 8 000 px² at density=1, cap at 300
    const count = Math.min(Math.round((W * H / 8_000) * density), 300);

    const particles: Particle[] = Array.from({ length: count }, () => {
      const ox = rand(0, W);
      const oy = rand(0, H);
      return { x: ox, y: oy, ox, oy, vx: 0, vy: 0, r: rand(1.5, 3.5), a: rand(0.3, 0.7) };
    });

    // ── mouse — listen on WINDOW so nothing blocks events ──────────────────────
    const mouse = { x: -99999, y: -99999, active: false };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX - offX;
      mouse.y = e.clientY - offY;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; mouse.x = -99999; mouse.y = -99999; };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave, { passive: true });

    // ── render loop ─────────────────────────────────────────────────────────────
    const MR2 = magnetRadius * magnetRadius;
    let raf = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;

        if (mouse.active && d2 < MR2 && d2 > 0.01) {
          const dist   = Math.sqrt(d2);
          const inv    = 1 - dist / magnetRadius;      // 1 at cursor → 0 at edge
          const force  = inv * inv * magnetStrength;   // quadratic, peaks at cursor
          p.vx += (dx / dist) * force * dist * 0.06;
          p.vy += (dy / dist) * force * dist * 0.06;
        }

        // Spring back to resting origin
        p.vx += (p.ox - p.x) * 0.022;
        p.vy += (p.oy - p.y) * 0.022;

        // Damping
        p.vx *= 0.84;
        p.vy *= 0.84;

        p.x += p.vx;
        p.y += p.vy;

        // Glow: inner bright core + soft outer halo
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
        gr.addColorStop(0, `rgba(255,255,255,${p.a})`);
        gr.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();
      }

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
      window.removeEventListener('mousemove', onMove);
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
