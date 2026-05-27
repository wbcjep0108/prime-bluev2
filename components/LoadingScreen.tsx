'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  progress: number;
  isLoaded: boolean;
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
            transition: {
              duration: 1.1,
              ease: [0.76, 0, 0.24, 1],
              delay: 0.2,
            },
          }}
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
        {/* Brand name — clip reveal from below */}
          <div className="overflow-hidden mb-4">
            <motion.p
              className="font-bebas text-base uppercase tracking-[0.6em] text-white/30"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
            >
              Prime Hydration
            </motion.p>
          </div>

          {/* Large title — each line clips independently */}
          <div className="overflow-hidden mb-1">
            <motion.span
              className="block font-bebas uppercase text-white text-center leading-none"
              style={{ fontSize: 'clamp(3.5rem, 11vw, 9rem)', letterSpacing: '-0.02em' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
            >
              PRIME
            </motion.span>
          </div>
          <div className="overflow-hidden mb-16">
            <motion.span
              className="block font-bebas uppercase text-white text-center leading-none"
              style={{ fontSize: 'clamp(3.5rem, 11vw, 9rem)', letterSpacing: '-0.02em' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.35 }}
            >
              HYDRATION
            </motion.span>
          </div>

          {/* Loading bar */}
          <div className="w-56 h-[2px] bg-white/15 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.2 }}
            />
          </div>

          {/* Percentage */}
          <p className="mt-4 text-white/25 text-xs font-mono tracking-[0.3em] uppercase">
            {progress}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
