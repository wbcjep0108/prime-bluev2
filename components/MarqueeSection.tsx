'use client';

import { useRef } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';

export default function MarqueeSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track as the section scrolls through the viewport (enter bottom → exit top)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Heavy spring = feels like the text has weight, creating the "slow" perception
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 18,
    restDelta: 0.001,
  });

  // Text travels right → left as section scrolls through viewport. No pinning.
  const x = useTransform(smoothProgress, [0, 1], ['80vw', '-90vw']);

  return (
    // No extra height — compact section, same visual weight as neighbors
    <div
      ref={containerRef}
      className="overflow-hidden bg-[#FBF6F6] py-10"
    >
      {/* Thin rule above */}
      <div className="w-full h-px bg-black/8 mb-6" />

      <motion.div style={{ x }} className="will-change-transform">
        <span
          className="whitespace-nowrap font-bebas uppercase select-none"
          style={{
            fontSize: 'clamp(5rem, 13vw, 13rem)',
            lineHeight: 1,
            color: '#000',
            fontWeight: 900,
            letterSpacing: '-0.02em',
          }}
        >
          STAY PRIME&nbsp;&nbsp; STAY HYDRATED
        </span>
      </motion.div>

      {/* Thin rule below */}
      <div className="w-full h-px bg-black/8 mt-6" />
    </div>
  );
}
