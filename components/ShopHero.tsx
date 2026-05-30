'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';



const slides = [
  { id: 'hydration', image: '/images/shop-hero/hydration.webp', title: 'Hydration' },
  { id: 'energy', image: '/images/shop-hero/energy.webp', title: 'Energy' },
  { id: 'shake', image: '/images/shop-hero/shake.webp', title: 'Shake' },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
  }),
  center: {
    x: 0,
    transition: { ease: [0.76, 0, 0.24, 1] as any, duration: 0.8 }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    transition: { ease: [0.76, 0, 0.24, 1] as any, duration: 0.8 }
  })
};

export default function ShopHero() {
  const [[page, direction], setPage] = useState([0, 0]);

  // Wrap index to always stay within bounds 0-2
  const imageIndex = ((page % slides.length) + slides.length) % slides.length;

  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  }, [page]);

  const goToSlide = (idx: number) => {
    setPage([idx, idx > imageIndex ? 1 : -1]);
  };

  // Auto-advance every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 3000);
    return () => clearInterval(timer);
  }, [paginate]);

  // Handle Drag
  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -10000) {
      paginate(1);
    } else if (swipe > 10000) {
      paginate(-1);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden group">
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={page}
          src={slides[imageIndex].image}
          alt={slides[imageIndex].title}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
        />
      </AnimatePresence>

      {/* Darkened overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 z-10 pointer-events-none" />

      {/* Loading Progress Bars - Smaller and centered */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex justify-center gap-3 w-48 z-20">
        {slides.map((slide, idx) => {
          return (
            <div 
              key={slide.id} 
              className="h-1.5 flex-1 bg-white/30 overflow-hidden rounded-full relative cursor-pointer hover:scale-y-150 transition-transform" 
              onClick={() => goToSlide(idx)}
            >
              {/* Completed slides are fully white */}
              {idx < imageIndex && (
                <div className="absolute top-0 left-0 h-full w-full bg-white" />
              )}
              
              {/* Current slide animates from 0 to 100 */}
              {idx === imageIndex && (
                <motion.div
                  key={page} // Forces re-animation when page changes
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="absolute top-0 left-0 h-full bg-white"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
