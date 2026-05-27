'use client';

import { RefObject } from 'react';
import { useScroll, useTransform, motion, useSpring, MotionValue } from 'framer-motion';

// ─── Clip-reveal wrapper ─────────────────────────────────────────────────────
function Reveal({
  children,
  isLoaded,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  isLoaded: boolean;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '105%' }}
        animate={isLoaded ? { y: '0%' } : { y: '105%' }}
        transition={{
          duration: 1.0,
          delay: 1.3 + delay,
          ease: [0.76, 0, 0.24, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Isolated word for scroll-scrubbed mid-overlays ──────────────────────────
// Must be its own component so useTransform isn't called inside .map()
function ScrubWord({
  text,
  progress,
  rangeIn,
  rangeOut,
}: {
  text: string;
  progress: MotionValue<number>;
  rangeIn: [number, number];
  rangeOut: [number, number];
}) {
  const opacity = useTransform(
    progress,
    [rangeIn[0], rangeIn[1], rangeOut[0], rangeOut[1]],
    [0, 1, 1, 0]
  );
  const scale = useTransform(progress, [rangeIn[0], rangeOut[1]], [0.9, 1.1]);
  return (
    <motion.h2
      style={{ opacity, scale }}
      className="fixed inset-0 flex items-center justify-center text-center pointer-events-none z-20
                 font-bebas text-7xl md:text-9xl font-black uppercase text-white drop-shadow-2xl"
    >
      {text}
    </motion.h2>
  );
}

interface TextOverlaysProps {
  isLoaded?: boolean;
  heroRef: RefObject<HTMLDivElement | null>;
}

export default function TextOverlays({ isLoaded = false, heroRef }: TextOverlaysProps) {
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  // Intro scroll-out
  const introOpacity = useTransform(smoothProgress, [0, 0.02, 0.06], [1, 1, 0]);
  const introY       = useTransform(smoothProgress, [0, 0.06], ['0%', '-8%']);

  return (
    <>
      {/* ── Intro hero — reveals on load, scrolls out on first scroll ──── */}
      <motion.div
        style={{ opacity: introOpacity, y: introY }}
        className="fixed inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-20 px-6 pt-24"
      >
        <Reveal isLoaded={isLoaded} delay={0}>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white mb-6 font-semibold drop-shadow-md">
            Prime Hydration · Est. 2022
          </p>
        </Reveal>

        <Reveal isLoaded={isLoaded} delay={0.1}>
          <h1
            className="uppercase font-black text-white leading-none select-none drop-shadow-2xl"
            style={{
              fontFamily: 'var(--font-theatre)',
              fontSize: 'clamp(5rem, 18vw, 18rem)',
              letterSpacing: '-0.03em',
              lineHeight: 0.85,
            }}
          >
            PRIME
          </h1>
        </Reveal>

        <Reveal isLoaded={isLoaded} delay={0.2}>
          <p
            className="uppercase font-black text-white leading-none select-none mt-1 drop-shadow-2xl"
            style={{
              fontFamily: 'var(--font-theatre)',
              fontSize: 'clamp(2.5rem, 8vw, 8rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Blue Raspberry
          </p>
        </Reveal>

        <Reveal isLoaded={isLoaded} delay={0.32} className="mt-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5">
            {['Zero Sugar', 'Electrolyte-Rich', '10% Coconut Water', '25 Vitamins & Minerals', 'Athlete Approved'].map((attr, i) => (
              <span key={attr} className="text-white text-[11px] md:text-xs uppercase tracking-[0.22em] font-semibold flex items-center gap-2 drop-shadow-md">
                {i > 0 && <span className="text-white">·</span>}
                {attr}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal isLoaded={isLoaded} delay={0.44} className="mt-8">
          <div className="flex items-center gap-8 md:gap-12">
            {[
              { value: '0g', label: 'Sugar' },
              { value: '835mg', label: 'Electrolytes' },
              { value: '10%', label: 'Coconut Water' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="font-black text-white leading-none tabular-nums drop-shadow-md"
                  style={{ fontFamily: 'var(--font-theatre)', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}>
                  {s.value}
                </span>
                <span className="text-white text-[9px] uppercase tracking-[0.2em] font-semibold mt-0.5 drop-shadow-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal isLoaded={isLoaded} delay={0.56} className="mt-10">
          <motion.div
            className="flex items-center gap-2 text-white text-[10px] tracking-[0.25em] uppercase font-semibold drop-shadow-sm"
            animate={isLoaded ? { y: [0, 6, 0] } : {}}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          >
            <span>Scroll to explore</span>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M3 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </Reveal>
      </motion.div>

      {/* ── Mid-scroll word flashes — confined to hero scroll range ────── */}
      <ScrubWord text="The Blue Freeze"     progress={smoothProgress} rangeIn={[0.02, 0.08]} rangeOut={[0.12, 0.15]} />
      <ScrubWord text="Triple Flavor Energy" progress={smoothProgress} rangeIn={[0.15, 0.20]} rangeOut={[0.24, 0.27]} />
      <ScrubWord text="Zero Sugar"           progress={smoothProgress} rangeIn={[0.27, 0.32]} rangeOut={[0.36, 0.39]} />
      <ScrubWord text="Pure Fuel"            progress={smoothProgress} rangeIn={[0.39, 0.44]} rangeOut={[0.48, 0.51]} />
    </>
  );
}
