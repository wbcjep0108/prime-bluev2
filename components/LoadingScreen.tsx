'use client';

import { motion, AnimatePresence } from 'framer-motion';
import CountUp from './CountUp';

interface LoadingScreenProps {
  progress: number;
  isLoaded: boolean;
}

// Clip-reveal: slides up from below the overflow-hidden wrapper
function ClipReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1], delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function LoadingScreen({ progress, isLoaded }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          key="loading"
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
          }}
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Label */}
          <ClipReveal delay={0.05}>
            <p className="font-bebas text-base uppercase tracking-[0.6em] text-white/40">
              Prime Hydration
            </p>
          </ClipReveal>

          {/* PRIME */}
          <ClipReveal delay={0.18} className="mt-1">
            <span
              className="block font-bebas uppercase text-white text-center leading-none"
              style={{ fontSize: 'clamp(3.5rem, 11vw, 9rem)', letterSpacing: '-0.02em' }}
            >
              PRIME
            </span>
          </ClipReveal>

          {/* HYDRATION */}
          <ClipReveal delay={0.3} className="mb-16">
            <span
              className="block font-bebas uppercase text-white text-center leading-none"
              style={{ fontSize: 'clamp(3.5rem, 11vw, 9rem)', letterSpacing: '-0.02em' }}
            >
              HYDRATION
            </span>
          </ClipReveal>

          {/* Count-up number */}
          <ClipReveal delay={0.45}>
            <div className="flex items-baseline gap-1">
              <CountUp
                from={0}
                to={progress}
                duration={0.4}
                startWhen={true}
                className="font-bebas text-white tabular-nums"
                style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', letterSpacing: '-0.02em', lineHeight: 1 }}
              />
              <span
                className="font-bebas text-white/50"
                style={{ fontSize: 'clamp(1.2rem, 3vw, 2.4rem)' }}
              >
                %
              </span>
            </div>
          </ClipReveal>

          {/* Loading label */}
          <ClipReveal delay={0.5}>
            <p className="text-white/25 text-[10px] font-mono tracking-[0.4em] uppercase mt-2">
              Loading
            </p>
          </ClipReveal>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
