'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useInView,
  MotionValue,
} from 'framer-motion';

// ─── Fade + drift in ──────────────────────────────────────────────────────────
function Drift({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-6% 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Per-word scrub — isolated so hooks aren't inside .map() ─────────────────
function ScrubWord({
  word,
  progress,
  index,
  total,
}: {
  word: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const start = index / total;
  // Cap the end at 0.95 so the last word fully illuminates just before the absolute end of the scroll.
  // Using 1.2 for the overlap so the fade-in feels natural.
  const end = Math.min(0.95, (index + 1.2) / total);
  const opacity = useTransform(progress, [start, end], [0, 1]);

  return (
    <motion.span
      style={{
        opacity,
        fontFamily: 'var(--font-theatre)',
        fontSize: 'clamp(2.8rem, 7.5vw, 8rem)',
        letterSpacing: '-0.02em',
      }}
      className="inline-block font-black uppercase text-white leading-none"
    >
      {word}
    </motion.span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const WORDS = [
  'NOT', 'A SPORTS DRINK.', 'NOT', 'A SODA.',
  'NOT', 'A SUPPLEMENT.', "IT'S", 'PRIME.'
];

export default function PrimeAbout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });

  return (
    <div ref={containerRef} className="relative" style={{ height: `${WORDS.length * 55}vh` }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center px-6 md:px-16 overflow-hidden bg-[#080808]">

        <Drift>
          <p className="font-bebas text-[10px] uppercase tracking-[0.45em] text-white mb-10 md:mb-14 drop-shadow-sm">

          </p>
        </Drift>

        <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-2">
          {WORDS.map((word, i) => (
            <ScrubWord
              key={i}
              word={word}
              progress={smooth}
              index={i}
              total={WORDS.length}
            />
          ))}
        </div>

        <Drift delay={0.1}>
          <p className="mt-10 md:mt-14 max-w-xl text-white text-sm md:text-base leading-relaxed font-medium drop-shadow-sm">
            Prime is the intersection of elite hydration science and cultural energy —
            created by two of the world's biggest creators for every competitor, athlete,
            and dreamer who refuses to settle.
          </p>
        </Drift>
      </div>
    </div>
  );
}
