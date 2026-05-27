'use client';

import { memo, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useMotionValue, animate, motion, useInView } from 'framer-motion';
import { usePageTransition } from './TransitionProvider';

const products = [
  {
    id: 1,
    name: 'Blue Raspberry',
    flavor: 'Ice Cold',
    tagline: 'The Original Freeze',
    badgeText: 'THE FREEZE',
    image: '/images/carousel/raspberry.webp',
    cardBg: 'radial-gradient(circle at 75% 65%, #33ccff 0%, #0055cc 40%, #001166 75%, #00001a 100%)',
    glowColor: '#0088ff',
    textColor: '#cce8ff',
    btnGradient: 'linear-gradient(135deg, #33ccff 0%, #0055cc 100%)',
    btnTextColor: '#001a4d',
    sectionBg: '#000814',
  },
  {
    id: 2,
    name: 'Lemon Lime',
    flavor: 'Sharp & Fresh',
    tagline: 'Zest for the Game',
    badgeText: 'THE ORIGINAL',
    image: '/images/carousel/lemon-lime.webp',
    cardBg: 'radial-gradient(circle at 75% 65%, #ddff00 0%, #66cc00 40%, #115500 75%, #021100 100%)',
    glowColor: '#88dd00',
    textColor: '#ddffaa',
    btnGradient: 'linear-gradient(135deg, #ddff00 0%, #66cc00 100%)',
    btnTextColor: '#0d2200',
    sectionBg: '#020900',
  },
  {
    id: 3,
    name: 'Lemonade',
    flavor: 'Sunshine Burst',
    tagline: 'Bright. Bold. Electric.',
    badgeText: 'THE SUNSHINE',
    image: '/images/carousel/lemonade.webp',
    cardBg: 'radial-gradient(circle at 75% 65%, #ffff44 0%, #ddaa00 40%, #553300 75%, #110600 100%)',
    glowColor: '#ffdd00',
    textColor: '#fff9cc',
    btnGradient: 'linear-gradient(135deg, #ffff44 0%, #ddaa00 100%)',
    btnTextColor: '#1a1400',
    sectionBg: '#080600',
  },
  {
    id: 4,
    name: 'Strawberry Watermelon',
    flavor: 'Sweet & Bold',
    tagline: 'Summer in a Bottle',
    badgeText: 'THE SWEET',
    image: '/images/carousel/strawberry.webp',
    cardBg: 'radial-gradient(circle at 75% 65%, #ff66cc 0%, #dd0066 40%, #660022 75%, #110005 100%)',
    glowColor: '#ff44aa',
    textColor: '#ffccee',
    btnGradient: 'linear-gradient(135deg, #ff66cc 0%, #dd0066 100%)',
    btnTextColor: '#1a0022',
    sectionBg: '#09000a',
  },
  {
    id: 5,
    name: 'Tropical Punch',
    flavor: 'Paradise Blast',
    tagline: 'Taste the Island',
    badgeText: 'THE PUNCH',
    image: '/images/carousel/tropical-punch.webp',
    cardBg: 'radial-gradient(circle at 75% 65%, #ff5533 0%, #cc1100 40%, #550000 75%, #0d0000 100%)',
    glowColor: '#ff3322',
    textColor: '#ffcccc',
    btnGradient: 'linear-gradient(135deg, #ff5533 0%, #cc1100 100%)',
    btnTextColor: '#1a0000',
    sectionBg: '#0a0000',
  },
];

const N = products.length;

// ─── Card dimensions ────────────────────────────────────────────────────────
const CARD_W = 380;
// ─────────────────────────────────────────────────────────────────────────────

interface FloatingBubbleProps {
  size: number;
  x: string;
  y: string;
  delay: number;
  duration?: number;
  zIndex?: number;
  opacity?: number;
  isNearScreen?: boolean;
  isActive?: boolean;
  motionPaused?: boolean;
}

const FloatingBubble = memo(function FloatingBubble({
  size,
  x,
  y,
  delay,
  duration = 4,
  zIndex = 5,
  opacity = 0.8,
  isNearScreen = true,
  isActive = false,
  motionPaused = false,
}: FloatingBubbleProps) {
  const shouldAnimate = isNearScreen && isActive && !motionPaused;
  return (
    <img
      src="/images/carousel/bubble.webp"
      alt=""
      aria-hidden
      draggable={false}
      className={`absolute pointer-events-none select-none${shouldAnimate ? ' carousel-bubble-float' : ''}`}
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        zIndex,
        opacity: isNearScreen ? opacity : 0,
        visibility: isNearScreen ? 'visible' : 'hidden',
        animationDuration: shouldAnimate ? `${duration}s` : undefined,
        animationDelay: shouldAnimate ? `${delay}s` : undefined,
        backfaceVisibility: 'hidden',
      }}
    />
  );
});

// ─── ProductCard — Styled completely flat and identical ───────────────────────
const ProductCard = memo(function ProductCard({
  product,
  isNearScreen,
  isActive,
  isFirstProduct,
  motionPaused = false,
  onProductClick,
}: {
  product: typeof products[0];
  isNearScreen: boolean;
  isActive: boolean;
  isFirstProduct: boolean;
  motionPaused?: boolean;
  onProductClick: (product: typeof products[0]) => void;
}) {
  // Only the first product card tilts left when selected; others stay fixed at 20deg.
  const bottleRotateDeg = isFirstProduct && isActive ? 15 : 20;
  const bottleTransform = `translate3d(-50%, 0, 0) rotate(${bottleRotateDeg}deg)`;
  // Keep the first bottle's rotation easing even while motionPaused (prevents snap).
  const bottleTransition = isFirstProduct
    ? 'transform 0.9s cubic-bezier(0.34, 1.26, 0.64, 1)'
    : 'none';

  return (
    <div
      className="relative shrink-0 select-none flex flex-col items-center justify-center overflow-visible"
      style={{
        width: CARD_W,
        height: 480,
        backfaceVisibility: 'hidden',
        contain: 'layout style',
        contentVisibility: isNearScreen ? 'visible' : 'auto',
        containIntrinsicSize: isNearScreen ? undefined : `${CARD_W}px 480px`,
      }}
    >
      {/* CARD CONTENT LAYER */}
      <div
        className="relative"
        style={{
          width: CARD_W,
          height: 260,
          backfaceVisibility: 'hidden',
        }}
      >
        {/* GPU Glow Layer (rendered behind tilted card body) - high performance blur */}
        {isNearScreen && (
          <div
            className="absolute inset-2 pointer-events-none"
            style={{
              transform: 'rotate(-10deg) translateZ(0)',
              borderRadius: '2.5rem',
              boxShadow: `0 0 50px 10px ${product.glowColor}`,
              opacity: isActive ? 0.25 : 0.08,
              zIndex: 1,
              transition: motionPaused ? 'none' : 'opacity 0.7s ease-in-out',
              backfaceVisibility: 'hidden',
            }}
          />
        )}

        {/* Tilted Card Body */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            background: product.cardBg,
            transform: 'rotate(-10deg) translateZ(0)',
            borderRadius: '2.5rem',
            boxShadow: '0 30px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.06)',
            zIndex: 2,
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
          
          <FloatingBubble size={36} x="8%"  y="18%" delay={0.2}  duration={8.5}  isNearScreen={isNearScreen} isActive={isActive} motionPaused={motionPaused} />
          <FloatingBubble size={24} x="82%" y="15%" delay={1.2}  duration={7.5}  isNearScreen={isNearScreen} isActive={isActive} motionPaused={motionPaused} />
          <FloatingBubble size={28} x="78%" y="55%" delay={2.1}  duration={9.5}  isNearScreen={isNearScreen} isActive={isActive} motionPaused={motionPaused} />
          <FloatingBubble size={26} x="15%" y="65%" delay={0.8}  duration={8.8}  isNearScreen={isNearScreen} isActive={isActive} motionPaused={motionPaused} />

          {/* BOTTLE A – clipped inside card */}
          <div className="absolute inset-0 pointer-events-none" style={{ isolation: 'isolate' }}>
            {isNearScreen && (
              <>
                {/* GPU-Accelerated colorful aura glow behind bottle */}
                <div
                  className="absolute bottom-[-130px] left-[25%] -translate-x-1/2 pointer-events-none"
                  style={{
                    width: '160px',
                    height: '520px',
                    background: `radial-gradient(ellipse at center, ${product.glowColor} 0%, transparent 70%)`,
                    opacity: 0.45,
                    transform: bottleTransform,
                    transformOrigin: 'bottom center',
                    transition: bottleTransition,
                    zIndex: 0,
                  }}
                />
                {/* GPU-Accelerated soft dark shadow behind bottle */}
                <div
                  className="absolute bottom-[-140px] left-[25%] -translate-x-1/2 pointer-events-none"
                  style={{
                    width: '140px',
                    height: '500px',
                    background: 'radial-gradient(ellipse at center, #000000 0%, transparent 70%)',
                    opacity: 0.6,
                    transform: bottleTransform,
                    transformOrigin: 'bottom center',
                    transition: bottleTransition,
                    zIndex: 0,
                  }}
                />
              </>
            )}
            <img
              src={product.image}
              alt={product.name}
              decoding="async"
              draggable={false}
              fetchPriority={isFirstProduct ? 'high' : 'low'}
              style={{
                position: 'absolute',
                bottom: '-150px',
                left: '25%',
                height: '575px',
                width: 'auto',
                objectFit: 'contain',
                transform: bottleTransform,
                transformOrigin: 'bottom center',
                transition: bottleTransition,
                zIndex: 1,
              }}
            />
          </div>
        </div>

        {/* BOTTLE B – cap pops above card (must stay in sync with Bottle A) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: 'rotate(-10deg) translateZ(0)', zIndex: 10 }}
        >
          <img
            src={product.image}
            alt=""
            aria-hidden
            decoding="async"
            draggable={false}
            style={{
              position: 'absolute',
              bottom: '-150px',
              left: '25%',
              height: '575px',
              width: 'auto',
              objectFit: 'contain',
              transform: bottleTransform,
              transformOrigin: 'bottom center',
              transition: bottleTransition,
              clipPath: 'inset(0px 0px 205px 0px)',
            }}
          />
        </div>

        {/* Badge text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: 'rotate(-10deg) translateZ(0)', zIndex: 25 }}
        >
          <div
            className="absolute bottom-[14%] left-[10%] select-none font-bebas tracking-wide uppercase font-black"
            style={{
              fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)',
              color: '#fff',
              transform: 'skewX(-6deg)',
              textShadow: `
                -2px -2px 0 #000, 2px -2px 0 #000,
                -2px  2px 0 #000, 2px  2px 0 #000,
                0px 4px 10px rgba(0,0,0,0.8)
              `,
            }}
          >
            {product.badgeText}
          </div>
        </div>

        <FloatingBubble size={54} x="-14%" y="22%"  delay={0}    duration={8.2}  zIndex={20} isNearScreen={isNearScreen} isActive={isActive} motionPaused={motionPaused} />
        <FloatingBubble size={36} x="75%"  y="-8%"  delay={1.0}  duration={9.0}  zIndex={20} isNearScreen={isNearScreen} isActive={isActive} motionPaused={motionPaused} />
        <FloatingBubble size={44} x="84%"  y="20%"  delay={1.8}  duration={7.0}  zIndex={20} isNearScreen={isNearScreen} isActive={isActive} motionPaused={motionPaused} />
        <FloatingBubble size={60} x="-10%" y="62%"  delay={0.5}  duration={10.5} zIndex={20} opacity={0.9} isNearScreen={isNearScreen} isActive={isActive} motionPaused={motionPaused} />
        <FloatingBubble size={26} x="72%"  y="60%"  delay={2.8}  duration={6.8}  zIndex={20} isNearScreen={isNearScreen} isActive={isActive} motionPaused={motionPaused} />
      </div>
    </div>
  );
});

const ProductSlide = memo(
  function ProductSlide({
    product,
    idx,
    slideIndex,
    cardScale,
    width,
    motionPaused,
    onProductClick,
  }: {
    product: (typeof products)[0];
    idx: number;
    slideIndex: number;
    cardScale: number;
    width: number;
    motionPaused: boolean;
    onProductClick: (product: typeof products[0]) => void;
  }) {
    const slidePos = idx + 1;
    const isNearScreen = Math.abs(slidePos - slideIndex) <= 1;
    const isActive = slidePos === slideIndex;

    return (
      <div
        className="h-full flex-shrink-0 flex items-center justify-center overflow-visible"
        style={{ width, contain: 'layout style' }}
      >
        <div
          style={{
            transform: `scale(${cardScale}) translateZ(0)`,
            transformOrigin: 'center center',
          }}
        >
          <ProductCard
            product={product}
            isNearScreen={isNearScreen}
            isActive={isActive}
            isFirstProduct={idx === 0}
            motionPaused={motionPaused}
            onProductClick={onProductClick}
          />
        </div>
      </div>
    );
  },
  (prev, next) => {
    const prevNear = Math.abs(prev.idx + 1 - prev.slideIndex) <= 1;
    const nextNear = Math.abs(next.idx + 1 - next.slideIndex) <= 1;
    const prevActive = prev.idx + 1 === prev.slideIndex;
    const nextActive = next.idx + 1 === next.slideIndex;
    return (
      prev.product.id === next.product.id &&
      prevNear === nextNear &&
      prevActive === nextActive &&
      prev.cardScale === next.cardScale &&
      prev.width === next.width &&
      prev.motionPaused === next.motionPaused &&
      prev.onProductClick === next.onProductClick
    );
  }
);

const SectionBackgrounds = memo(function SectionBackgrounds({
  productIndex,
  motionPaused,
}: {
  productIndex: number;
  motionPaused: boolean;
}) {
  return (
    <>
      {products.map((product, idx) => (
        <div
          key={`bg-${product.id}`}
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: idx === productIndex ? 1 : 0,
            visibility: idx === productIndex ? 'visible' : 'hidden',
            background: `radial-gradient(circle at 50% 50%, ${product.glowColor}14 0%, ${product.sectionBg}1a 30%, #000000 70%)`,
            zIndex: 0,
            transition: motionPaused ? 'none' : 'opacity 2s ease-in-out',
            backfaceVisibility: 'hidden',
          }}
        />
      ))}
    </>
  );
});

export default function ProductCarousel() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [motionPaused, setMotionPaused] = useState(false);
  const [vw, setVw] = useState(1200);
  const [vh, setVh] = useState(800);

  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const busy = useRef(false);
  const slideRef = useRef(0);
  const wheelAccumulator = useRef(0);
  const mounted = useRef(true);
  const activeAnimation = useRef<{ stop: () => void } | null>(null);

  const sectionInView = useInView(sectionRef, { once: true, margin: '-10% 0px' });
  const { navigateTo } = usePageTransition();

  // Track mounted state to guard setState after unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Cancel any in-flight animation on unmount
      if (activeAnimation.current) {
        activeAnimation.current.stop();
        activeAnimation.current = null;
      }
    };
  }, []);

  const handleProductClick = useCallback((product: typeof products[0]) => {
    const slug = product.name.toLowerCase().replace(/ /g, '-');
    navigateTo(`/shop/hydration/${slug}`);
  }, [navigateTo]);

  // Geometry computation variables
  const isMobile = vw < 768;
  const W_t = isMobile ? vw * 0.72 : vw * 0.28;
  const W_c = isMobile ? vw * 0.90 : vw * 0.62;
  const G = isMobile ? vw * 0.06 : vw * 0.02;
  const P_l = isMobile ? vw * 0.04 : vw * 0.06;

  const cardScale = isMobile
    ? Math.min((vh * 0.48) / 480, (vw * 0.72) / CARD_W, 1.1)
    : Math.max(1.28, Math.min((vh * 0.56) / 480, (vw * 0.46) / CARD_W, 1.55));

  // Active product mapping
  const productIndex = Math.max(0, slideIndex - 1);
  const active = products[productIndex];

  // Measure window sizing (rAF-debounced to avoid layout thrash)
  useEffect(() => {
    let raf = 0;
    const handleResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setVw(window.innerWidth);
        setVh(window.innerHeight);
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Compute translation coordinate targets
  const getTargetX = useCallback(
    (idx: number) => {
      if (idx === 0) {
        return 0; // align directly to container's left padding
      }
      const centerAbs = P_l + W_t + G + (idx - 1) * (W_c + G) + W_c / 2;
      return vw / 2 - centerAbs;
    },
    [vw, W_t, W_c, G, P_l]
  );

  const minX = getTargetX(N);
  const maxX = getTargetX(0);

  const spring = useCallback(
    (targetIdx: number) => {
      const targetX = getTargetX(targetIdx);
      // Cancel any previous in-flight animation before starting a new one
      if (activeAnimation.current) {
        activeAnimation.current.stop();
        activeAnimation.current = null;
      }
      const controls = animate(x, targetX, {
        type: 'spring',
        stiffness: 62,
        damping: 22,
        mass: 1.25,
        onComplete: () => {
          if (!mounted.current) return;
          busy.current = false;
          activeAnimation.current = null;
        },
      });
      activeAnimation.current = controls;
    },
    [x, getTargetX]
  );

  // Reposition track translation instantly on window resize/width change
  useEffect(() => {
    const targetX = getTargetX(slideRef.current);
    x.set(targetX);
  }, [vw, getTargetX, x]);

  // Preload carousel assets
  useEffect(() => {
    products.forEach((p) => {
      const img = new Image();
      img.src = p.image;
    });
    const bubble = new Image();
    bubble.src = '/images/carousel/bubble.webp';
  }, []);

  const goNext = useCallback(() => {
    if (busy.current || slideRef.current >= N) return;
    busy.current = true;
    const next = slideRef.current + 1;
    slideRef.current = next;
    setSlideIndex(next);
    spring(next);
  }, [spring]);

  const goPrev = useCallback(() => {
    if (busy.current || slideRef.current <= 0) return;
    busy.current = true;
    const prev = slideRef.current - 1;
    slideRef.current = prev;
    setSlideIndex(prev);
    spring(prev);
  }, [spring]);

  const goToProduct = useCallback(
    (productIdx: number) => {
      const target = productIdx + 1;
      if (busy.current || target === slideRef.current) return;
      busy.current = true;
      slideRef.current = target;
      setSlideIndex(target);
      spring(target);
    },
    [spring]
  );

  // Drag snapping logic
  const onDragStart = useCallback(() => {
    // Reset busy so drag can always interrupt an in-flight spring
    busy.current = false;
    if (activeAnimation.current) {
      activeAnimation.current.stop();
      activeAnimation.current = null;
    }
  }, []);

  const onDragEnd = useCallback((_event: unknown, info: { velocity: { x: number } }) => {
    const currentX = x.get();
    const velocity = info.velocity.x;
    const FLICK_VELOCITY = 150;

    let bestIdx = 0;

    if (velocity < -FLICK_VELOCITY) {
      bestIdx = Math.min(slideRef.current + 1, N);
    } else if (velocity > FLICK_VELOCITY) {
      bestIdx = Math.max(slideRef.current - 1, 0);
    } else {
      let minDiff = Infinity;
      for (let i = 0; i <= N; i++) {
        const tX = getTargetX(i);
        const diff = Math.abs(currentX - tX);
        if (diff < minDiff) {
          minDiff = diff;
          bestIdx = i;
        }
      }
    }

    if (!mounted.current) return;
    slideRef.current = bestIdx;
    setSlideIndex(bestIdx);
    busy.current = true;
    spring(bestIdx);
  }, [x, getTargetX, spring]);

  // Native wheel handler — avoids React synthetic event overhead
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (busy.current) return;

      wheelAccumulator.current += e.deltaX;
      if (wheelAccumulator.current > 80) {
        wheelAccumulator.current = 0;
        goNext();
      } else if (wheelAccumulator.current < -80) {
        wheelAccumulator.current = 0;
        goPrev();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [goNext, goPrev]);

  // Text slide animation variants
  const containerVariants = useMemo(
    () => ({
      hidden: {},
      visible: { transition: { staggerChildren: 0.22, delayChildren: 0.1 } },
    }),
    []
  );
  const lineVariants = useMemo(
    () => ({
      hidden: { y: 80, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 1.4, ease: [0.76, 0, 0.24, 1] as [number, number, number, number] },
      },
    }),
    []
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black flex flex-col justify-between"
      style={{
        minHeight: isMobile ? '100svh' : 'max(680px, calc(100svh + 5rem))',
        height: isMobile ? '100svh' : 'max(680px, calc(100svh + 5rem))',
      }}
    >
      <SectionBackgrounds productIndex={productIndex} motionPaused={motionPaused} />

      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] max-w-[800px] max-h-[800px] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${active.glowColor} 0%, transparent 60%)`,
          opacity: 0.15,
          transition: motionPaused ? 'none' : 'background 1.8s ease',
          zIndex: 0,
        }}
      />

      {/* ── Viewport-height track container ─────────────────────────────────── */}
      <div className="relative z-10 w-full flex-grow min-h-0 overflow-hidden">
        <motion.div
          ref={trackRef}
          drag="x"
          dragConstraints={{ left: minX, right: maxX }}
          dragElastic={0.15}
          dragMomentum={false}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="absolute top-0 left-0 h-full flex items-center cursor-grab active:cursor-grabbing overflow-visible box-border"
          style={{
            x,
            gap: `${G}px`,
            paddingLeft: `${P_l}px`,
            paddingRight: `${P_l}px`,
            paddingTop: isMobile ? 'clamp(3rem, 7vh, 5rem)' : 'clamp(5rem, 11vh, 8rem)',
            paddingBottom: isMobile ? 'clamp(6rem, 14vh, 8rem)' : 'clamp(8.5rem, 19vh, 11rem)',
            willChange: motionPaused ? 'transform' : 'auto',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* ── SLIDE 0: Left-Aligned Editorial text ────────────────────────── */}
          <div
            className="h-full flex-shrink-0 flex items-center justify-start overflow-visible select-none box-border"
            style={{ width: W_t, paddingTop: isMobile ? '0' : 'clamp(0.5rem, 1.5vh, 1.25rem)' }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={sectionInView ? 'visible' : 'hidden'}
              className="text-left select-none max-w-full"
            >
              {/* "We Have" */}
              <div style={{ overflow: 'hidden' }}>
                <motion.p
                  variants={lineVariants}
                  className="font-bebas uppercase tracking-widest text-white leading-none"
                  style={{ fontSize: isMobile ? 'clamp(1.1rem, 4.5vw, 2rem)' : 'clamp(2rem, 3.5vw, 3.8rem)', opacity: 0.75 }}
                >
                  We Have
                </motion.p>
              </div>

              {/* "05  ORIGINAL" */}
              <div style={{ overflow: 'hidden' }}>
                <motion.div
                  variants={lineVariants}
                  className="flex items-baseline justify-start gap-2 flex-wrap"
                  style={{ marginTop: isMobile ? '0.25rem' : '0.5rem', marginBottom: isMobile ? '0.25rem' : '0.5rem' }}
                >
                  <span
                    className="font-sans font-black text-white leading-none tracking-tighter"
                    style={{ fontSize: isMobile ? 'clamp(3.5rem, 14vw, 6rem)' : 'clamp(6rem, 12vw, 13rem)', fontWeight: 900 }}
                  >
                    05
                  </span>
                  <div
                    className="font-bebas font-black uppercase"
                    style={{
                      fontSize: isMobile ? 'clamp(1rem, 4vw, 2rem)' : 'clamp(2.2rem, 3.8vw, 3.8rem)',
                      backgroundColor: active.glowColor,
                      color: '#000',
                      transform: 'rotate(-4deg)',
                      lineHeight: 1,
                      padding: isMobile ? '4px 10px' : '8px 24px',
                      transition: motionPaused ? 'none' : 'background-color 1.6s ease',
                    }}
                  >
                    ORIGINAL
                  </div>
                </motion.div>
              </div>

              {/* "FLAVOURS" */}
              <div style={{ overflow: 'hidden' }}>
                <motion.p
                  variants={lineVariants}
                  className="font-bebas font-black uppercase text-white leading-none tracking-wide"
                  style={{ fontSize: isMobile ? 'clamp(2.5rem, 10vw, 5rem)' : 'clamp(4.5rem, 8.5vw, 9.5rem)' }}
                >
                  Flavours
                </motion.p>
              </div>

              {/* CTA hint */}
              <div style={{ overflow: 'hidden' }}>
                <motion.p
                  variants={lineVariants}
                  className="font-bebas uppercase tracking-[0.2em] text-white"
                  style={{
                    fontSize: isMobile ? '0.65rem' : '1.1rem',
                    opacity: 0.5,
                    color: active.glowColor,
                    marginTop: isMobile ? '0.5rem' : '1.75rem',
                    transition: motionPaused ? 'none' : 'color 1.6s ease',
                  }}
                >
                  Swipe or use controls to explore
                </motion.p>
              </div>
            </motion.div>
          </div>

          {/* ── SLIDES 1..N: Product cards, centered & scaled ────────────────── */}
          {products.map((product, idx) => (
            <ProductSlide
              key={product.id}
              product={product}
              idx={idx}
              slideIndex={slideIndex}
              cardScale={cardScale}
              width={W_c}
              motionPaused={motionPaused}
              onProductClick={handleProductClick}
            />
          ))}
        </motion.div>
      </div>

      {/* ── Fixed CTA button and Nav controls ─────────────────────────────────── */}
      <div className="relative z-20 flex flex-col items-center gap-3 md:gap-4 pb-4 md:pb-8 pt-4">
        {/* CTA Button */}
        <div className="pointer-events-auto mb-1 md:mb-2">
          <motion.button
            onClick={() => handleProductClick(active)}
            className="flex items-center font-bold uppercase text-xs md:text-sm tracking-wider transition-transform hover:scale-105 active:scale-95 whitespace-nowrap bg-transparent border-none p-0"
            style={{
              color: active.glowColor,
              textShadow: `0 0 16px ${active.glowColor}aa`,
              transition: motionPaused ? 'none' : 'color 0.5s ease, text-shadow 0.5s ease',
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            Explore {active.name}
          </motion.button>
        </div>

        <div className="flex items-center justify-center gap-6 animate-fade-in">
          <button
            onClick={goPrev}
            disabled={slideIndex === 0}
            aria-label="Previous"
            className="flex items-center justify-center transition-all duration-300 hover:scale-125 active:scale-90 disabled:opacity-20 disabled:pointer-events-none bg-transparent border-none p-2"
            style={{
              color: active.glowColor,
              transition: 'color 0.5s ease',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
              <path d="M11 4l-5 5 5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dots — only for product slides */}
          <div className="flex items-center gap-3">
            {products.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => goToProduct(idx)}
                aria-label={`Go to ${p.name}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: slideIndex === idx + 1 ? 32 : 8,
                  height: 8,
                  backgroundColor: slideIndex === idx + 1 ? active.glowColor : 'rgba(255,255,255,0.25)',
                  boxShadow: slideIndex === idx + 1 ? `0 0 12px ${active.glowColor}` : 'none',
                  transition: 'width 0.35s ease, background-color 0.5s ease, box-shadow 0.5s ease',
                }}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={slideIndex === N}
            aria-label="Next"
            className="flex items-center justify-center transition-all duration-300 hover:scale-125 active:scale-90 disabled:opacity-20 disabled:pointer-events-none bg-transparent border-none p-2"
            style={{
              color: active.glowColor,
              transition: 'color 0.5s ease',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
              <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Tagline — fades in on product slides */}
        <p
          className="font-bebas text-xl uppercase tracking-widest text-center"
          style={{
            color: active.glowColor,
            textShadow: `0 0 20px ${active.glowColor}88`,
            transition: 'color 0.5s ease, text-shadow 0.5s ease, opacity 0.4s ease',
            opacity: slideIndex > 0 ? 0.85 : 0,
            minHeight: '1.75rem',
          }}
        >
          {active.tagline}
        </p>
      </div>
    </section>
  );
}
