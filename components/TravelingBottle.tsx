'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { productData } from '../data/product';

export default function TravelingBottle() {
  const { scrollYProgress } = useScroll();

  // Opacity: 0 during 0-0.49, 1 at 0.50+
  const opacity = useTransform(scrollYProgress, [0.48, 0.5], [0, 1]);

  // Movement Path
  // 0.5 -> appear on RIGHT
  // 0.6 -> 0.8 rotate -10deg and move LEFT
  // 0.8 -> 0.95 rotate +10deg and move RIGHT
  // 0.95 -> 1.0 settle CENTER, scale 1.1

  const x = useTransform(
    scrollYProgress,
    [0.5, 0.6, 0.8, 0.95, 1],
    ['25vw', '25vw', '-25vw', '25vw', '0vw']
  );

  const rotate = useTransform(
    scrollYProgress,
    [0.5, 0.6, 0.8, 0.95, 1],
    [0, 0, -10, 10, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [0.5, 0.95, 1],
    [1, 1, 1.1]
  );

  return (
    <motion.div
      style={{ opacity, x, y: 0, rotate, scale }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-30"
    >
      <img
        src={productData.staticAssets.staticBottle}
        alt="Prime Bottle"
        className="max-h-[55vh] w-auto object-contain drop-shadow-2xl"
      />
    </motion.div>
  );
}
