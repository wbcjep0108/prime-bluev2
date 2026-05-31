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
          duration: 1.8,
          delay: 1.5 + delay * 1.8,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── Isolated word for scroll-scrubbed mid-overlays ──────────────────────────
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
      {/* ── DESKTOP LAYOUT ── */}
      <motion.div
        style={{ opacity: introOpacity, y: introY }}
        className="fixed inset-0 z-20 hidden md:flex flex-col justify-between p-12 pt-28 pb-10 pointer-events-none select-none"
      >
        {/* Subtle vertical grid lines */}
        <div className="absolute inset-0 pointer-events-none flex z-0">
          <div className="w-1/3 border-r border-white/5 h-full" />
          <div className="w-1/3 border-r border-white/5 h-full" />
          <div className="w-1/3 h-full" />
        </div>

        {/* Content body — 3-column grid */}
        <div className="grid grid-cols-12 gap-8 items-center flex-grow relative z-10">

          {/* LEFT — product context */}
          <div className="col-span-4 flex flex-col justify-center items-start text-left pr-4">
            <Reveal isLoaded={isLoaded} delay={0}>
              <p className="text-[10px] uppercase tracking-[0.45em] text-[#66AAFF] mb-4 font-black">
                ■ Zero Sugar. Pure Fuel.
              </p>
            </Reveal>

            <Reveal isLoaded={isLoaded} delay={0.1}>
              <h2 className="font-bebas text-4xl lg:text-5xl xl:text-6xl font-black uppercase text-white leading-[0.85] tracking-tight">
                Blue Raspberry
              </h2>
            </Reveal>

            <Reveal isLoaded={isLoaded} delay={0.2}>
              <p className="font-bebas text-2xl lg:text-3xl uppercase text-[#66AAFF] leading-none mt-2">
                Ice Cold.
              </p>
            </Reveal>

            <Reveal isLoaded={isLoaded} delay={0.3}>
              <p className="text-[#cccccc] text-xs leading-relaxed uppercase tracking-wider font-semibold max-w-[34ch] mt-5">
                Our signature Blue Raspberry is not just a flavour — it is a temperature drop. That sharp,
                electric freeze hits the second it crosses your lips.
              </p>
            </Reveal>

            {/* KSI & Logan Paul credit — sits naturally below description */}
            <Reveal isLoaded={isLoaded} delay={0.38}>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#0066FF]" />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[#cccccc] font-semibold leading-none">
                    Co-Founded by
                  </p>
                  <p className="font-bebas text-base text-white uppercase tracking-wide leading-tight mt-0.5">
                    KSI &amp; Logan Paul
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* CENTER — BIG PRIME */}
          <div className="col-span-4 flex flex-col items-center justify-center text-center">
            <Reveal isLoaded={isLoaded} delay={0.12}>
              <h1
                className="font-bebas font-black uppercase text-white leading-none select-none"
                style={{
                  fontSize: 'clamp(8rem, 18vw, 18rem)',
                  letterSpacing: '-0.02em',
                  lineHeight: 0.8,
                  textShadow: '0 0 80px rgba(0,102,255,0.35)',
                }}
              >
                PRIME
              </h1>
            </Reveal>
            <Reveal isLoaded={isLoaded} delay={0.22}>
              <p className="text-[9px] uppercase tracking-[0.5em] text-[#cccccc] font-semibold mt-3">
                Est. 2022
              </p>
            </Reveal>
          </div>

          {/* RIGHT — spec cards */}
          <div className="col-span-4 flex flex-col justify-between items-end text-right h-full py-16 pl-4">
            <div className="flex flex-col items-end gap-6 text-right w-full">
              <Reveal isLoaded={isLoaded} delay={0.35}>
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 backdrop-blur-md max-w-[300px] text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 rounded bg-[#0066FF] flex items-center justify-center font-bebas text-black font-black text-[10px] select-none">
                      H2O
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#66AAFF] font-bold">
                      Cellular Hydration
                    </span>
                  </div>
                  <h3 className="font-bebas text-base text-white uppercase tracking-wider mb-1">
                    Advanced Performance
                  </h3>
                  <p className="text-[#cccccc] text-[11px] leading-relaxed uppercase tracking-wider font-semibold">
                    10% coconut water and 834mg of vital electrolytes deliver immediate hydration.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="flex flex-col items-end gap-2 text-right max-w-[280px]">
              <Reveal isLoaded={isLoaded} delay={0.45}>
                <span className="text-[#66AAFF] text-[10px] uppercase tracking-[0.3em] font-black">
                  ■ Signature Blend
                </span>
                <h3 className="font-bebas text-base text-white uppercase tracking-wider mt-1">
                  Zero Compromise.
                </h3>
                <p className="text-[#cccccc] text-[11px] leading-relaxed uppercase tracking-wider font-semibold mt-1">
                  Fueled with 250mg of BCAAs, zero artificial colors, and B vitamins to push past limits.
                </p>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Bottom HUD row */}
        <div className="flex justify-between items-end w-full pt-4 border-t border-white/5 relative z-10">

          {/* Bottom-left HUD widget */}
          <Reveal isLoaded={isLoaded} delay={0.5}>
            <div className="w-[180px] h-[90px] bg-white/[0.02] border border-white/10 rounded-lg p-3 flex flex-col justify-between backdrop-blur-sm text-left">
              <div className="flex justify-between items-center text-[8px] font-mono tracking-widest text-[#cccccc]">
                <span>BOTTLE SPEC 01</span>
                <span className="text-[#0066FF]">SYS // OK</span>
              </div>
              <div className="flex gap-1.5 items-end">
                <div className="h-6 w-1 bg-white/20 rounded-full overflow-hidden relative">
                  <div className="absolute bottom-0 left-0 right-0 h-[80%] bg-[#0066FF]" />
                </div>
                <div className="h-8 w-1 bg-white/20 rounded-full overflow-hidden relative">
                  <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-[#0066FF]" />
                </div>
                <div className="h-10 w-1 bg-white/20 rounded-full overflow-hidden relative">
                  <div className="absolute bottom-0 left-0 right-0 h-[90%] bg-[#66AAFF]" />
                </div>
                <span className="font-bebas text-xs text-white leading-none ml-2 tracking-widest">RAS.05</span>
              </div>
            </div>
          </Reveal>

          {/* Bottom-center developer credit */}
          <Reveal isLoaded={isLoaded} delay={0.55}>
            <p className="text-[8px] uppercase tracking-[0.4em] text-[#cccccc] font-semibold text-center">
              Developed by Harry Lagto
            </p>
          </Reveal>

          {/* Bottom-right stats */}
          <Reveal isLoaded={isLoaded} delay={0.5}>
            <div className="flex items-center gap-8 text-right">
              {[
                { value: '0g', label: 'Sugar' },
                { value: '835mg', label: 'Electrolytes' },
                { value: '10%', label: 'Coconut Water' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-end">
                  <span
                    className="font-black text-white leading-none tabular-nums drop-shadow-md"
                    style={{ fontFamily: 'var(--font-theatre)', fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)' }}
                  >
                    {s.value}
                  </span>
                  <span className="text-[#cccccc] text-[9px] uppercase tracking-[0.2em] font-semibold mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </motion.div>

      {/* ── MOBILE LAYOUT ── */}
      <motion.div
        style={{ opacity: introOpacity, y: introY }}
        className="fixed inset-0 z-20 flex md:hidden flex-col justify-between p-6 pt-24 pb-8 pointer-events-none select-none"
      >
        {/* Top-left label */}
        <div className="flex flex-col items-start">
          <Reveal isLoaded={isLoaded} delay={0}>
            <p className="text-[9px] uppercase tracking-[0.45em] text-[#66AAFF] font-black">
              ■ Zero Sugar. Pure Fuel.
            </p>
          </Reveal>
          <Reveal isLoaded={isLoaded} delay={0.1}>
            <h2 className="font-bebas text-3xl uppercase text-white leading-none tracking-tight mt-1">
              Blue Raspberry
            </h2>
          </Reveal>
        </div>

        {/* Center — BIG PRIME */}
        <div className="flex flex-col items-center justify-center text-center flex-1">
          <Reveal isLoaded={isLoaded} delay={0.15}>
            <h1
              className="font-bebas font-black uppercase text-white leading-none select-none"
              style={{
                fontSize: 'clamp(6rem, 28vw, 12rem)',
                letterSpacing: '-0.02em',
                lineHeight: 0.85,
                textShadow: '0 0 60px rgba(0,102,255,0.4)',
              }}
            >
              PRIME
            </h1>
          </Reveal>
          <Reveal isLoaded={isLoaded} delay={0.25}>
            <p className="text-[8px] uppercase tracking-[0.5em] text-[#cccccc] font-semibold mt-2">
              KSI &amp; Logan Paul · Est. 2022
            </p>
          </Reveal>
        </div>

        {/* Bottom stats row */}
        <div className="flex flex-col items-center gap-4 pb-4">
          <Reveal isLoaded={isLoaded} delay={0.4}>
            <div className="flex items-center gap-6">
              {[
                { value: '0g', label: 'Sugar' },
                { value: '835mg', label: 'Electro' },
                { value: '10%', label: 'Coconut' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center">
                  <span className="font-bebas text-lg text-white font-bold leading-none">{s.value}</span>
                  <span className="text-[#cccccc] text-[8px] uppercase tracking-[0.15em] font-semibold mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal isLoaded={isLoaded} delay={0.5}>
            <p className="text-[7px] uppercase tracking-[0.4em] text-[#cccccc] font-semibold">
              Developed by Harry Lagto
            </p>
          </Reveal>
        </div>
      </motion.div>

      {/* ── Mid-scroll word flashes ── */}
      <ScrubWord text="The Blue Freeze"     progress={smoothProgress} rangeIn={[0.02, 0.08]} rangeOut={[0.12, 0.15]} />
      <ScrubWord text="Triple Flavor Energy" progress={smoothProgress} rangeIn={[0.15, 0.20]} rangeOut={[0.24, 0.27]} />
      <ScrubWord text="Zero Sugar"           progress={smoothProgress} rangeIn={[0.27, 0.32]} rangeOut={[0.36, 0.39]} />
      <ScrubWord text="Pure Fuel"            progress={smoothProgress} rangeIn={[0.39, 0.44]} rangeOut={[0.48, 0.51]} />
    </>
  );
}
