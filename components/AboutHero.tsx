'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const TITLE = 'ABOUT US';
const LETTERS = TITLE.split('');

// Container stagger
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

// Each letter slides up from beneath its overflow-hidden wrapper
const letterVariants = {
  hidden: { y: '105%' },
  visible: {
    y: '0%',
    transition: {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1] as any,
    },
  },
};

// Underline grows left → right after letters
const underlineVariants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 1.1,
      delay: 0.85,
      ease: [0.76, 0, 0.24, 1] as any,
    },
  },
};

// Scroll hint fades in last
const hintVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 1.6, ease: 'easeOut' as any },
  },
};

export default function AboutHero() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-5% 0px' });

  return (
    <section
      ref={ref}
      className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#080808] overflow-hidden"
    >
      {/* Faint grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Eyebrow label */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
        className="font-bebas uppercase tracking-[0.4em] text-white/30 text-xs md:text-sm mb-8 md:mb-10 select-none"
      >
        Est. 2022 &nbsp;·&nbsp; Drink Prime
      </motion.p>

      {/* Main title — letters stagger up */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="flex flex-wrap items-end justify-center"
        aria-label={TITLE}
        style={{ gap: '0 0.04em' }}
      >
        {LETTERS.map((char, i) =>
          char === ' ' ? (
            <span key={i} style={{ width: '0.3em', display: 'inline-block' }} />
          ) : (
            <span
              key={i}
              style={{ overflow: 'hidden', display: 'inline-block', lineHeight: 0.9 }}
            >
              <motion.span
                variants={letterVariants}
                className="block font-bebas font-black uppercase text-white select-none"
                style={{
                  fontSize: 'clamp(5rem, 18vw, 18rem)',
                  letterSpacing: '-0.02em',
                  willChange: 'transform',
                }}
              >
                {char}
              </motion.span>
            </span>
          )
        )}
      </motion.div>

      {/* Underline — draws left → right */}
      <div className="w-full flex justify-center mt-2 md:mt-4 px-6">
        <div style={{ width: 'min(78vw, 1200px)' }}>
          <motion.div
            variants={underlineVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="h-[2px] bg-white origin-left"
            style={{ transformOrigin: 'left' }}
          />
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        variants={hintVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 select-none"
      >
        <span className="font-bebas uppercase tracking-[0.35em] text-white/25 text-[10px] md:text-xs">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="w-[1px] h-8 bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}
