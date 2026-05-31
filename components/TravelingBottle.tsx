'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { productData } from '../data/product';
import Galaxy from './Galaxy';

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
      style={{ opacity }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-30"
    >
      <div style={{ position: 'absolute', width: '1080px', height: '1080px', zIndex: -1 }}>
        <Galaxy
          starSpeed={0.5}
          density={1}
          hueShift={140}
          speed={1}
          glowIntensity={0.3}
          saturation={0}
          mouseRepulsion
          repulsionStrength={2}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          transparent
        />
      </div>
      <motion.img
        style={{ x, rotate, scale }}
        src={productData.staticAssets.staticBottle}
        alt="Prime Bottle"
        className="max-h-[55vh] w-auto object-contain drop-shadow-2xl"
      />
    </motion.div>
  );
}
