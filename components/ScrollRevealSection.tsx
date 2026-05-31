'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// Each row clips text via overflow-hidden and slides upward from beneath
function RevealRow({
  children,
  progress,
  start,
  end,
}: {
  children: React.ReactNode;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  start: number;
  end: number;
}) {
  const rawY = useTransform(progress, [start, end], ['105%', '0%']);
  const y = useSpring(rawY, { stiffness: 45, damping: 24, mass: 0.7 });

  return (
    // overflow-hidden is the "floor" that hides text below it
    <div className="w-full overflow-hidden flex justify-center" style={{ paddingBottom: '0.1em' }}>
      <motion.div
        style={{ y, willChange: 'transform' }}
        className="flex items-baseline justify-center gap-3 md:gap-8 whitespace-nowrap"
      >
        {children}
      </motion.div>
    </div>
  );
}

const FONT_SIZE = 'clamp(3rem, 10.5vw, 11.5rem)';
const LABEL_SIZE = 'clamp(8px, 1.1vw, 14px)';
const FONT_FAMILY = 'var(--font-bebas, "Bebas Neue", sans-serif)';

export default function ScrollRevealSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-black py-28 md:py-44 flex flex-col justify-center items-center z-20 border-t border-white/5"
    >
      <div className="max-w-[1400px] w-full flex flex-col gap-2 md:gap-4 select-none px-4">

        {/* Row 1 — first to rise */}
        <RevealRow progress={scrollYProgress} start={0.02} end={0.35}>
          <span
            className="font-bebas font-black uppercase tracking-tight text-white leading-none"
            style={{ fontSize: FONT_SIZE, fontFamily: FONT_FAMILY }}
          >
            Hydration
          </span>
          <div
            className="text-left font-sans tracking-[0.3em] text-white/40 uppercase font-semibold leading-tight self-center"
            style={{ fontSize: LABEL_SIZE }}
          >
            <div>Engineered</div>
            <div>For Athletes</div>
          </div>
        </RevealRow>

        {/* Row 2 — rises slightly after row 1 */}
        <RevealRow progress={scrollYProgress} start={0.12} end={0.45}>
          <div
            className="text-left font-sans tracking-[0.3em] text-white/40 uppercase font-semibold leading-tight self-center"
            style={{ fontSize: LABEL_SIZE }}
          >
            <div>0 Sugar.</div>
            <div>0 Compromise.</div>
          </div>
          <span
            className="font-bebas font-black uppercase tracking-tight text-white leading-none"
            style={{ fontSize: FONT_SIZE, fontFamily: FONT_FAMILY }}
          >
            Redefined.
          </span>
        </RevealRow>

        {/* Row 3 — rises last */}
        <RevealRow progress={scrollYProgress} start={0.22} end={0.55}>
          <span
            className="font-bebas font-black uppercase tracking-tight text-white leading-none"
            style={{ fontSize: FONT_SIZE, fontFamily: FONT_FAMILY }}
          >
            This Is Prime.
          </span>
        </RevealRow>

      </div>
    </section>
  );
}
