'use client';

import React, { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
} from 'framer-motion';

// ─── Card data ─────────────────────────────────────────────────────────────────

const CARDS = [
  {
    num: '01',
    tag: 'The Flavor',
    headline: 'Blue Raspberry\nIce Cold.',
    body: "Our signature Blue Raspberry isn't a flavour — it's a temperature drop. That sharp, electric freeze hits the second it crosses your lips.",
    attrs: ['Signature Flavour', 'Zero Artificial Colour', 'Iconic Since 2022'],
    placeholderBg: 'linear-gradient(135deg, #001A72 0%, #0066FF 60%, #66AAFF 100%)',
    bg: '#080810',
    accent: '#4488FF',
    textLight: true,
    image: '/images/stacked-cards/card1.svg',
  },
  {
    num: '02',
    tag: 'The Formula',
    headline: 'Zero Sugar.\nZero Compromise.',
    body: 'mg of electrolytes, 10% coconut water, 25 vitamins and minerals — everything your body demands after putting it through hell.',
    attrs: ['0g Sugar', '835mg Electrolytes', '10% Coconut Water'],
    placeholderBg: 'linear-gradient(135deg, #F5F0E8 0%, #D8D0C4 100%)',
    bg: '#F5F0E8',
    accent: '#0066FF',
    textLight: false,
    image: '/images/stacked-cards/card2.svg',
  },
  {
    num: '03',
    tag: 'The Proof',
    headline: 'Built For\nChampions.',
    body: "Trusted by NFL rosters, WWE rings, and 40M+ fans worldwide. Prime isn't sponsored by champions — it's built by them.",
    attrs: ['NFL Official Partner', 'Athlete-Approved', 'Global Distribution'],
    placeholderBg: 'linear-gradient(135deg, #4A0010 0%, #CC1030 55%, #FF2040 100%)',
    bg: '#1A0008',
    accent: '#FF4060',
    textLight: true,
    image: '/images/stacked-cards/card3.svg',
  },
  {
    num: '04',
    tag: 'The Next Level',
    headline: 'Prime\nEnergy.',
    body: '200mg of natural caffeine, zero sugar, and 300mg of electrolytes. For when hydration alone won\'t cut it.',
    attrs: ['200mg Caffeine', 'Zero Sugar', 'B Vitamins'],
    placeholderBg: 'linear-gradient(135deg, #1a0a00 0%, #cc7700 55%, #FFB800 100%)',
    bg: '#0A0804',
    accent: '#FFB800',
    textLight: true,
    image: '/images/stacked-cards/card4.svg',
  },
] as const;

// ─── Card layout (shared, no motion here) ─────────────────────────────────────

function CardContent({ card }: { card: (typeof CARDS)[number] }) {
  const textColor = card.textLight ? '#ffffff' : '#080810';
  const subTextColor = card.textLight ? '#ffffff' : '#080810';
  const divider = card.textLight ? 'rgba(255,255,255,0.15)' : 'rgba(8,8,16,0.15)';

  return (
    <div
      className="w-full h-full"
      style={{
        backgroundColor: card.bg,
        clipPath: 'polygon(0 0, calc(100% - 2rem) 0, 100% 2rem, 100% 100%, 2rem 100%, 0 calc(100% - 2rem))',
        overflow: 'hidden',
      }}
    >
      <div className="h-full" style={{ display: 'grid', gridTemplateColumns: '40% 60%' }}>

        {/* LEFT — image placeholder */}
        <div
          className="relative overflow-hidden h-full w-full border-r border-solid"
          style={{ borderColor: divider }}
        >
          <div className="absolute inset-0" style={{ background: card.placeholderBg }} />

          {/* Card Image — covers placeholder gradient when a valid file exists */}
          <img
            src={card.image}
            alt={card.tag}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              // Hide broken SVG exports that load but have no real dimensions
              if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                img.style.opacity = '0';
              }
            }}
            onError={(e) => {
              // Hide if the file is missing entirely (404)
              (e.target as HTMLImageElement).style.opacity = '0';
            }}
          />

          {/* Watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center font-bebas select-none pointer-events-none"
            style={{
              fontSize: 'clamp(7rem, 18vw, 16rem)',
              color: card.textLight ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              lineHeight: 1,
            }}
          >
            {card.num}
          </div>
          {/* Bottom label */}
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-6">
            <p
              className="font-bebas text-[10px] uppercase tracking-[0.4em]"
              style={{ color: subTextColor }}
            >
              Prime Hydration
            </p>
          </div>
        </div>

        {/* RIGHT — text */}
        <div className="flex flex-col justify-between px-10 md:px-14 py-10 md:py-12 h-full">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <span
              className="font-bebas text-xs uppercase tracking-[0.4em]"
              style={{ color: card.accent }}
            >
              {card.tag}
            </span>
            <span
              className="font-bebas text-xs uppercase tracking-[0.3em]"
              style={{ color: subTextColor }}
            >
              {card.num} / 04
            </span>
          </div>

          {/* Headline + body */}
          <div className="my-auto md:my-0">
            <h3
              className="font-black uppercase leading-none mb-5"
              style={{
                fontFamily: 'var(--font-theatre)',
                fontSize: 'clamp(2.6rem, 5vw, 5.5rem)',
                letterSpacing: '-0.03em',
                color: textColor,
                whiteSpace: 'pre-line',
              }}
            >
              {card.headline}
            </h3>
            <p
              className="text-base md:text-lg leading-relaxed font-medium"
              style={{ color: subTextColor, maxWidth: '38ch' }}
            >
              {card.body}
            </p>
          </div>

          {/* Attributes */}
          <div
            className="flex flex-wrap gap-2 pt-5"
            style={{ borderTop: `1px solid ${divider}` }}
          >
            {card.attrs.map((attr) => (
              <span
                key={attr}
                className="text-[10px] md:text-xs uppercase tracking-[0.18em] font-semibold px-3 py-1.5 rounded-full"
                style={{ border: `1px solid ${divider}`, color: subTextColor }}
              >
                {attr}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared card inset (all cards occupy the exact same rect) ─────────────────
// top: 60px clears the navbar; 8px gap on all other sides = tight but framed
const INSET = { top: 60, side: 8, bottom: 8 };

const cardStyle: React.CSSProperties = {
  position: 'absolute',
  top: INSET.top,
  left: INSET.side,
  right: INSET.side,
  bottom: INSET.bottom,
};

// ─── Animated card ────────────────────────────────────────────────────────────

function AnimatedCard({
  card,
  progress,
  zIndex,
  enterStart,
  enterEnd,
  initialRotate,
  restRotate,
}: {
  card: (typeof CARDS)[number];
  progress: MotionValue<number>;
  zIndex: number;
  enterStart: number;
  enterEnd: number;
  initialRotate: number;
  restRotate: number;
}) {
  // Y in pixels — starts at 110vh (one full screen below), lands at 0
  const y = useTransform(
    progress,
    [enterStart, enterEnd],
    ['110vh', '0vh']
  );

  // Rotation rights itself at 40% of travel, card is already upright while still climbing
  const rotateEnd = enterStart + (enterEnd - enterStart) * 0.4;
  const rotate = useTransform(
    progress,
    [enterStart, rotateEnd, enterEnd],
    [initialRotate, restRotate * 0.1, restRotate]
  );

  return (
    <motion.div style={{ ...cardStyle, zIndex, y, rotate }}>
      <CardContent card={card} />
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StackedCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Raw scroll progress — Lenis already smooths the scroll.
  const progress = scrollYProgress;

  return (
    <div
      ref={containerRef}
      className="relative bg-[#080808]"
      style={{ height: '520vh' }} // taller = slower card travel
    >
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 55%, rgba(0,102,255,0.06) 0%, transparent 60%)',
          }}
        />

        {/* Section label */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 z-[100]" style={{ height: INSET.top }}>
          <p className="font-bebas text-[10px] uppercase tracking-[0.4em] text-white drop-shadow-sm">
            
          </p>
          <p className="font-bebas text-[10px] uppercase tracking-[0.4em] text-white drop-shadow-sm">
            
          </p>
        </div>

        {/* ── Card 1 — static, already in position ── */}
        <div style={{ ...cardStyle, zIndex: 10 }}>
          <CardContent card={CARDS[0]} />
        </div>

        {/* ── Card 2 ── */}
        <AnimatedCard
          card={CARDS[1]}
          progress={progress}
          zIndex={20}
          enterStart={0.05}
          enterEnd={0.37}
          initialRotate={9}
          restRotate={0}
        />

        {/* ── Card 3 ── */}
        <AnimatedCard
          card={CARDS[2]}
          progress={progress}
          zIndex={30}
          enterStart={0.37}
          enterEnd={0.67}
          initialRotate={-7}
          restRotate={0}
        />

        {/* ── Card 4 ── */}
        <AnimatedCard
          card={CARDS[3]}
          progress={progress}
          zIndex={40}
          enterStart={0.67}
          enterEnd={0.97}
          initialRotate={10}
          restRotate={0}
        />
      </div>
    </div>
  );
}
