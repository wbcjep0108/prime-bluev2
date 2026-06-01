'use client';

import React, { useRef } from 'react';
import { useScroll, useTransform, motion, useInView } from 'framer-motion';
import { productData } from '../data/product';


function TriggerReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-15% 0px' });

  return (
    <div ref={ref} className="w-full">
      <motion.div
        initial={false}
        animate={isInView ? { y: 0, clipPath: 'inset(-50% -50% -50% -50%)' } : { y: 100, clipPath: 'inset(100% 0 0 0)' }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function PostSequenceContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll progress 0→1 across the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Fade in only — as the container slides into viewport from below. No fade out.
  const { scrollYProgress: slideUpProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'start start']
  });
  const opacity = useTransform(slideUpProgress, [0.5, 1], [0, 1]);

  // x: travels right → left → CLAMPS at -25vw (section 3 left column center)
  const x = useTransform(
    scrollYProgress,
    [0, 0.5, 0.65],
    ['25vw', '25vw', '-25vw']
  );

  // Rotate: lean while traveling → perfectly upright when locked
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65],
    [3, 6, 0]
  );

  return (
    // Container is exactly 300vh (3 × 100vh sections)
    <div ref={containerRef} className="relative bg-[#020202] text-white" style={{ height: '300vh', overflowX: 'clip' }}>

      {/* ── STICKY BOTTLE & BACKGROUND ──────────────────────────────────────────
          Sticks at top:0 for the full 300vh scroll.
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden z-20">



        {/* Bottle layer — pointer-events-none so it doesn't block galaxy mouse */}
        <motion.div
          style={{ opacity, x, rotate }}
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        >
          {/* Aura glows */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[55vh]"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,136,255,0.18) 0%, transparent 65%)' }}
          />
          <div
            className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[40vh]"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 65%)' }}
          />
          <img
            src={productData.staticAssets.staticBottle}
            alt="Prime Bottle"
            className="max-h-[55vh] w-auto object-contain relative z-10"
          />
        </motion.div>
      </div>

      {/* ── CONTENT SECTIONS ───────────────────────────────────────────────────
          Absolutely overlaid on top of the sticky bottle layer.
          Glass cards sit ABOVE the bottle (z-40 > z-20).
          Left columns stay empty to keep the bottle visible through the background.
      */}
      <div className="absolute inset-0">

        {/* Section 1: Hydration Specs — text on LEFT, bottle travels on RIGHT */}
        <section className="h-[100vh] flex items-center px-8 md:px-24 relative z-40">
          <div className="w-full md:w-1/2 pr-0 md:pr-8">
            <TriggerReveal>
              <div
                className="rounded-3xl p-8 md:p-10 backdrop-blur-md bg-black/40 border border-white/10"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 32px 64px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255,255,255,0.08)' }}
              >
                <h2 className="text-5xl md:text-6xl font-bebas uppercase mb-8 text-white tracking-wide">
                  Hydration Specs
                </h2>
                <div className="space-y-5">
                  {productData.postSequenceContent.hydrationSpecs.map((spec) => (
                    <div key={spec.label} className="flex justify-between items-end border-b border-white/10 pb-3">
                      <span className="text-lg md:text-xl font-semibold uppercase tracking-widest text-slate-400">{spec.label}</span>
                      <span className="text-3xl md:text-4xl font-bebas text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TriggerReveal>
          </div>
          <div className="hidden md:block w-1/2" />
        </section>

        {/* Section 2: Athlete Tested — text on LEFT, bottle travels on RIGHT */}
        <section className="h-[100vh] flex items-center px-8 md:px-24 relative z-40">
          <div className="w-full md:w-1/2 pr-0 md:pr-8">
            <TriggerReveal>
              <div
                className="rounded-3xl p-8 md:p-10 backdrop-blur-md bg-black/40 border border-white/10"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 32px 64px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255,255,255,0.08)' }}
              >
                <h2 className="text-5xl md:text-6xl font-bebas uppercase mb-6 text-white tracking-wide">
                  Athlete Tested
                </h2>
                <p className="text-lg md:text-2xl font-medium leading-relaxed text-slate-200">
                  {productData.postSequenceContent.athleteTested}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {['KSI', 'Logan Paul', 'Pro Verified', 'WADA Safe'].map((tag) => (
                    <span key={tag} className="px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-widest border border-white/10 text-white bg-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </TriggerReveal>
          </div>
          <div className="hidden md:block w-1/2" />
        </section>

        {/* Section 3: Final CTA — bottle LOCKED on LEFT, text on RIGHT */}
        <section className="h-[100vh] flex items-center px-8 md:px-24 relative z-40">
          {/* Left column empty — the sticky bottle sits here, locked at -25vw */}
          <div className="hidden md:block w-1/2" />

          {/* Right column: CTA card */}
          <div className="w-full md:w-1/2 pl-0 md:pl-8 flex flex-col items-start justify-center">
            <TriggerReveal>
              <div
                className="rounded-3xl p-8 md:p-10 backdrop-blur-md bg-black/40 border border-white/10 w-full"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 32px 64px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255,255,255,0.08)' }}
              >
                <p className="font-bebas text-lg uppercase tracking-[0.3em] text-slate-400 mb-3">
                  Prime Hydration
                </p>
                <h2 className="text-5xl md:text-6xl font-bebas uppercase mb-6 text-white leading-tight tracking-wide">
                  {productData.staticAssets.finalTagline}
                </h2>
                <p className="text-base md:text-lg text-slate-300 mb-8 font-medium leading-relaxed">
                  Engineered for peak performance. Trusted by the world's top athletes.
                </p>
                <button className="hover-underline bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-slate-200 transition-all duration-300 uppercase text-lg tracking-widest shadow-2xl hover:scale-105 active:scale-95 transform">
                  {productData.price} Buy Now
                </button>
              </div>
            </TriggerReveal>
          </div>
        </section>

      </div>
    </div>
  );
}
