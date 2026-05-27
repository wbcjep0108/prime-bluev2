"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { EnergyProduct } from "../data/energyProducts";
import { ENERGY_MAIN_NOTES, ENERGY_IMAGE_VIEWS, getEnergyViewImage, type EnergyImageView } from "../data/energyFeatures";
import { usePageTransition } from "./TransitionProvider";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
  }),
  center: {
    x: 0,
    transition: { ease: [0.76, 0, 0.24, 1] as any, duration: 0.8 }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    transition: { ease: [0.76, 0, 0.24, 1] as any, duration: 0.8 }
  })
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M4.5 7l4.5 4.5L13.5 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ProductViewImage({
  slug,
  view,
  label,
  accent,
  priority = false,
}: {
  slug: string;
  view: EnergyImageView;
  label: string;
  accent: string;
  priority?: boolean;
}) {
  const src = getEnergyViewImage(slug, view);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-white/15 bg-[#111] p-6 text-center"
        style={{ boxShadow: `inset 0 0 80px ${accent}18` }}
      >
        <span className="font-bebas text-2xl uppercase tracking-wide text-white">{label}</span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-white">Placeholder</span>
        <code className="mt-2 max-w-full truncate text-[10px] text-white">{src}</code>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${label} view`}
      onError={() => setFailed(true)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className="h-full w-full object-contain p-6 md:p-10 pointer-events-none select-none"
    />
  );
}

const breadcrumbLinkClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-white hover-underline transition-all duration-500 bg-transparent border-none p-0 cursor-pointer";

export default function EnergyProductDetail({ product }: { product: EnergyProduct }) {
  const [[page, direction], setPage] = useState([0, 0]);
  const activeIndex = ((page % ENERGY_IMAGE_VIEWS.length) + ENERGY_IMAGE_VIEWS.length) % ENERGY_IMAGE_VIEWS.length;
  const activeView = ENERGY_IMAGE_VIEWS[activeIndex].id;

  const [descOpen, setDescOpen] = useState(true);
  const { navigateTo } = usePageTransition();

  const accent = product.bg;
  const AMAZON_PRIME_PRODUCT_URL = "";

  const goToView = (idx: number) => {
    setPage([idx, idx > activeIndex ? 1 : -1]);
  };

  const paginate = useCallback((newDirection: number) => {
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  }, []);

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -10000) {
      paginate(1);
    } else if (swipe > 10000) {
      paginate(-1);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(interval);
  }, [paginate]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-28 md:px-16 md:pt-32">
        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-white">
          <button type="button" onClick={() => navigateTo("/")} className={breadcrumbLinkClass}>Home</button>
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">/</span>
          <button type="button" onClick={() => navigateTo("/shop")} className={breadcrumbLinkClass}>Shop</button>
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">/</span>
          <button type="button" onClick={() => navigateTo("/shop?category=Energy")} className={breadcrumbLinkClass}>Energy</button>
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">/</span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Gallery */}
          <div>
            <div
              className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]"
              style={{
                background: `radial-gradient(circle at 50% 35%, ${accent}22 0%, #0d0d0d 55%, #000 100%)`,
              }}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={page}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={handleDragEnd}
                  className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing flex justify-center items-center"
                >
                  <ProductViewImage
                    slug={product.slug}
                    view={activeView}
                    label={ENERGY_IMAGE_VIEWS[activeIndex].label}
                    accent={accent}
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Progress Line Indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center gap-3 w-40 z-20">
                {ENERGY_IMAGE_VIEWS.map((view, idx) => {
                  return (
                    <div
                      key={view.id}
                      className="h-1 flex-1 bg-white/20 overflow-hidden rounded-full relative cursor-pointer hover:scale-y-150 transition-transform"
                      onClick={() => goToView(idx)}
                    >
                      {idx < activeIndex && (
                        <div className="absolute top-0 left-0 h-full w-full bg-white" />
                      )}
                      {idx === activeIndex && (
                        <motion.div
                          key={page}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 5, ease: "linear" }}
                          className="absolute top-0 left-0 h-full bg-white"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {ENERGY_IMAGE_VIEWS.map((view, idx) => {
                const isActive = activeView === view.id;
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => goToView(idx)}
                    className="relative aspect-square overflow-hidden rounded-xl border transition-all duration-200"
                    style={{
                      borderColor: isActive ? accent : "rgba(255,255,255,0.1)",
                      boxShadow: isActive ? `0 0 24px ${accent}44` : "none",
                      background: isActive ? `${accent}12` : "#111",
                    }}
                    aria-label={`Show ${view.label} view`}
                    aria-pressed={isActive}
                  >
                    <ProductViewImage slug={product.slug} view={view.id} label={view.label} accent={accent} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.45em] text-white">Prime Energy</p>
            <h1 className="font-bebas text-5xl uppercase leading-none tracking-tight text-white md:text-6xl xl:text-7xl">{product.name}</h1>
            <p className="mt-2 font-bebas text-3xl text-white md:text-4xl">${product.price.toFixed(2)}</p>
            <p className="mt-3 text-sm font-medium uppercase tracking-widest text-white" style={{ color: product.light }}>{product.tagline}</p>

            {/* Description accordion */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <button
                type="button"
                onClick={() => setDescOpen((o) => !o)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-bold uppercase tracking-widest text-white">Description</span>
                <Chevron open={descOpen} />
              </button>
              {descOpen && (
                <div className="border-t border-white/10 px-5 pb-5 pt-4">
                  <p className="text-sm leading-relaxed text-white">{product.tagline}</p>
                </div>
              )}
            </div>

            {/* Main notes */}
            <div className="mt-8">
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Main Notes</p>
              <div className="flex flex-wrap gap-2">
                {ENERGY_MAIN_NOTES.map((note) => (
                  <span
                    key={note}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Buy */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="group relative flex-1 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest"
                onClick={() => {
                  if (!AMAZON_PRIME_PRODUCT_URL) {
                    console.warn('TODO: add Amazon Prime product link for', product.slug ?? product.name);
                    return;
                  }
                  window.location.href = AMAZON_PRIME_PRODUCT_URL;
                }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ backgroundColor: accent }}
                />
                <span className="relative z-10 block text-black transition-colors duration-300 group-hover:text-white">
                  Buy Now
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
