'use client';

import { useScroll, useSpring, motion } from 'framer-motion';

export default function ScrollProgressIndicator() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 220, damping: 28, restDelta: 0.001 });

  return (
    <div
      className="prime-scroll-indicator"
      aria-hidden
    >
      <motion.div
        className="prime-scroll-indicator__fill"
        style={{ scaleY }}
      />
    </div>
  );
}

