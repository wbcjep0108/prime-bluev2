'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

// Four panels — each plays a different segment of the same video
const PANELS = [
  { id: 'top',    startTime: 0  },
  { id: 'mid-l',  startTime: 8  },
  { id: 'mid-r',  startTime: 18 },
  { id: 'bottom', startTime: 28 },
] as const;

// ─── Individual video panel ───────────────────────────────────────────────────
function VideoPanel({
  startTime,
  index,
  isHovered,
  showPlayHint,
}: {
  startTime: number;
  index: number;
  isHovered: boolean;
  showPlayHint?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seededRef = useRef(false);
  const inView = useInView(containerRef, { margin: '-10% 0px' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Seek to the clip's start point once metadata is ready
  const handleCanPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || seededRef.current) return;
    seededRef.current = true;
    v.currentTime = startTime;
  }, [startTime]);

  // Play / pause in sync with hover state / scroll state on mobile
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const shouldPlay = isMobile ? inView : isHovered;
    if (shouldPlay) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isHovered, inView, isMobile]);

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-xl bg-[#0a0a0a]"
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{
        duration: 0.75,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        boxShadow: isHovered
          ? '0 0 0 1.5px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.06)'
          : '0 0 0 1px rgba(255,255,255,0.07)',
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src="/videos/ad.mp4"

        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
        onCanPlay={handleCanPlay}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Dark veil when paused */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500"
        style={{ background: 'rgba(0,0,0,0.38)', opacity: isHovered ? 0 : 1 }}
      />

      {/* Hover glow rim */}
      <div
        className="absolute inset-0 z-10 pointer-events-none rounded-xl transition-opacity duration-400"
        style={{
          background: 'rgba(255,255,255,0.025)',
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* "Hover to play" hint on first panel only */}
      {showPlayHint && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-400"
          style={{ opacity: isHovered ? 0 : 1 }}
        >
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
              <path d="M4 2.5l10 5.5-10 5.5V2.5z" />
            </svg>
            <span className="font-bebas uppercase tracking-[0.28em] text-white text-[11px]">
              Hover to play
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VideoBento() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="w-full bg-[#060606] py-16 md:py-24 px-4 md:px-8 lg:px-16">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="mb-6 md:mb-8 flex items-center gap-4"
      >
        <div className="w-8 h-[1px] bg-white" />
        <span className="font-bebas uppercase tracking-[0.35em] text-white text-xs md:text-sm">
          The Prime World
        </span>
      </motion.div>

      {/*
        Layout:
          ┌──────────────────────┐
          │       TOP (big)      │
          ├──────────┬───────────┤
          │ MID LEFT │ MID RIGHT │
          ├──────────┴───────────┤
          │      BOTTOM (big)    │
          └──────────────────────┘
      */}
      <div
        className="grid gap-3 w-full"
        style={{
          gridTemplateAreas: `
            "top    top"
            "mid-l  mid-r"
            "bottom bottom"
          `,
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr auto 1fr',
          minHeight: '100vh',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* TOP */}
        <div style={{ gridArea: 'top', minHeight: '38vh' }} className="h-full">
          <VideoPanel startTime={0} index={0} isHovered={isHovered} showPlayHint />
        </div>

        {/* MID LEFT — square */}
        <div style={{ gridArea: 'mid-l', aspectRatio: '1 / 1' }}>
          <VideoPanel startTime={8} index={1} isHovered={isHovered} />
        </div>

        {/* MID RIGHT — square */}
        <div style={{ gridArea: 'mid-r', aspectRatio: '1 / 1' }}>
          <VideoPanel startTime={18} index={2} isHovered={isHovered} />
        </div>

        {/* BOTTOM */}
        <div style={{ gridArea: 'bottom', minHeight: '38vh' }} className="h-full">
          <VideoPanel startTime={28} index={3} isHovered={isHovered} />
        </div>
      </div>

      {/* Caption */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-5 text-center font-bebas uppercase tracking-[0.3em] text-white text-[10px] md:text-xs select-none"
      >
        Hover any panel to experience Prime
      </motion.p>
    </section>
  );
}
