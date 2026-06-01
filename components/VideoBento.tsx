'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// 3 columns × 2 rows = 6 cells
// Each cell shows a unique region of the video frame:
//   video is 300% wide × 200% tall inside the cell
//   left = -(col * 100%),  top = -(row * 100%)
const CELLS = [
  { col: 0, row: 0 },
  { col: 1, row: 0 },
  { col: 2, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 1 },
];

interface BentoCellProps {
  col: number;
  row: number;
  videoSrc: string;
  videoRef: (el: HTMLVideoElement | null) => void;
  isHovered: boolean;
  onCellEnter: () => void;
  onCellLeave: () => void;
  index: number;
}

function BentoCell({
  col,
  row,
  videoSrc,
  videoRef,
  isHovered,
  onCellEnter,
  onCellLeave,
  index,
}: BentoCellProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg bg-black cursor-pointer"
      onMouseEnter={onCellEnter}
      onMouseLeave={onCellLeave}
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      style={{
        boxShadow: isHovered
          ? '0 0 0 1.5px rgba(255,255,255,0.4), 0 0 32px rgba(255,255,255,0.06)'
          : '0 0 0 1px rgba(255,255,255,0.06)',
        transition: 'box-shadow 0.35s ease',
      }}
    >
      {/* Hover overlay — subtle bright veil */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300"
        style={{ background: 'rgba(255,255,255,0.04)', opacity: isHovered ? 1 : 0 }}
      />

      {/* Paused overlay with play hint */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-300"
        style={{ opacity: isHovered ? 0 : 1 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.22)' }}
        />
        {/* Show tiny play icon only on first cell */}
        {index === 0 && (
          <div className="relative z-20 flex items-center gap-2 opacity-60">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M4 2.5l10 5.5-10 5.5V2.5z" />
            </svg>
            <span className="font-bebas uppercase tracking-[0.25em] text-white text-xs">
              Hover to play
            </span>
          </div>
        )}
      </div>

      {/* Video — windowed to this cell's quadrant */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute pointer-events-none"
        style={{
          width: '300%',
          height: '200%',
          left: `${-col * 100}%`,
          top: `${-row * 100}%`,
          objectFit: 'fill',
          willChange: 'transform',
        }}
      />
    </motion.div>
  );
}

export default function VideoBento() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [hoveredGrid, setHoveredGrid] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const setVideoRef = useCallback(
    (index: number) => (el: HTMLVideoElement | null) => {
      videoRefs.current[index] = el;
    },
    []
  );

  const playAll = useCallback(() => {
    setHoveredGrid(true);
    videoRefs.current.forEach((v) => {
      if (v && v.paused) {
        v.play().catch(() => {});
      }
    });
  }, []);

  const pauseAll = useCallback(() => {
    setHoveredGrid(false);
    videoRefs.current.forEach((v) => {
      if (v && !v.paused) {
        v.pause();
      }
    });
  }, []);

  // Sync all videos to the first video's currentTime when they first load
  useEffect(() => {
    const primary = videoRefs.current[0];
    if (!primary) return;
    const onPlay = () => {
      const t = primary.currentTime;
      videoRefs.current.slice(1).forEach((v) => {
        if (v) v.currentTime = t;
      });
    };
    primary.addEventListener('play', onPlay);
    return () => primary.removeEventListener('play', onPlay);
  }, []);

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
        <div className="w-8 h-[1px] bg-white/25" />
        <span className="font-bebas uppercase tracking-[0.35em] text-white/30 text-xs md:text-sm">
          The Prime World
        </span>
      </motion.div>

      {/* Bento grid */}
      <div
        ref={gridRef}
        className="grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          // Maintain 16:9 across the whole grid
          aspectRatio: '16 / 9',
          maxHeight: '78vh',
        }}
      >
        {CELLS.map((cell, i) => (
          <BentoCell
            key={i}
            index={i}
            col={cell.col}
            row={cell.row}
            videoSrc="/videos/ad.mp4"
            videoRef={setVideoRef(i)}
            isHovered={hoveredGrid}
            onCellEnter={playAll}
            onCellLeave={pauseAll}
          />
        ))}
      </div>

      {/* Caption */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-5 text-center font-bebas uppercase tracking-[0.3em] text-white/20 text-[10px] md:text-xs select-none"
      >
        Hover any panel to experience Prime
      </motion.p>
    </section>
  );
}
