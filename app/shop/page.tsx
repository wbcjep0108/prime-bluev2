'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { usePageTransition } from '../../components/TransitionProvider';
import ShopHero from '../../components/ShopHero';
import InfiniteMarquee from '../../components/InfiniteMarquee';
import Footer from '../../components/Footer';
import { hydrationProducts, type HydrationProduct } from '../../data/hydrationProducts';
import { energyProducts, type EnergyProduct } from '../../data/energyProducts';
import { shakeProducts, type ShakeProduct } from '../../data/shakeProducts';

type AnyProduct = HydrationProduct | EnergyProduct | ShakeProduct;

function getProductHref(product: AnyProduct): string | null {
  if (product.category === 'Hydration') {
    return `/shop/hydration/${product.slug}`;
  }
  if (product.category === 'Energy') {
    return `/shop/energy/${product.slug}`;
  }
  if (product.category === 'Shake') {
    return `/shop/shake/${product.slug}`;
  }
  return null;
}

// ── Per-card component so hover state is local (no re-render of full list) ──
function ProductCard({ product }: { product: AnyProduct }) {
  const [hovered, setHovered] = useState(false);
  const { navigateTo } = usePageTransition();
  const href = getProductHref(product);

  const cardInner = (
    <>
      {/* Image container with wipe background */}
      <div className="relative overflow-hidden mb-4 aspect-square rounded-sm bg-[#151515] border border-white/5">

        {/* Layer 2 — wipes in L→R on hover, reverses on leave */}
        <div
          className="absolute inset-0 bg-white"
          style={{
            clipPath: hovered ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
            transition: hovered
              ? 'clip-path 0.55s cubic-bezier(0.76,0,0.24,1)'
              : 'clip-path 0.50s cubic-bezier(0.76,0,0.24,1)',
          }}
        />

        {/* Product image — always on top */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-contain p-4 z-10 transition-transform duration-500 group-hover:scale-105"
        />


      </div>

      {/* Info row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-tight text-white leading-tight mb-1">
            {product.name}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: product.bg }} />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
              {product.category}
            </span>
          </div>
        </div>
        <span className="text-sm font-bold text-white shrink-0 tabular-nums">
          ${product.price.toFixed(2)}
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <button
        type="button"
        onClick={() => navigateTo(href)}
        className="group block w-full cursor-pointer text-left bg-transparent border-none p-0"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {cardInner}
      </button>
    );
  }

  return (
    <div
      className="group cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {cardInner}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const allProducts: AnyProduct[] = [...hydrationProducts, ...energyProducts, ...shakeProducts];
type Category = 'All' | 'Hydration' | 'Energy' | 'Shake';
const categories: Category[] = ['All', 'Hydration', 'Energy', 'Shake'];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') as Category | null;
  
  const [activeCategory, setActiveCategory] = useState<Category>(
    initialCat && categories.includes(initialCat) ? initialCat : 'All'
  );

  useEffect(() => {
    const cat = searchParams.get('category') as Category | null;
    if (cat && categories.includes(cat)) {
      setActiveCategory(cat);
    }
  }, [searchParams]);
  
  const filteredProducts = activeCategory === 'All' 
    ? allProducts 
    : allProducts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero */}
      <div
        className="relative w-full overflow-hidden flex items-end"
        style={{ height: '72vh', minHeight: 480 }}
      >
        <div className="absolute inset-0 z-0">
          <ShopHero />
        </div>
        
        <div className="relative z-10 px-6 md:px-16 pb-16 w-full pointer-events-none">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-white/60 mb-3 drop-shadow-md">Prime Hydration</p>
          <h2 className="font-bebas text-6xl md:text-8xl uppercase text-white leading-none tracking-tight drop-shadow-xl">
            New Arrivals
          </h2>
        </div>
      </div>

      {/* Infinite Marquee Conveyor */}
      <InfiniteMarquee />

      {/* Section header */}
      <div className="pt-12 pb-8 px-6 md:px-16 border-b border-white/10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/35 mb-2">Prime Hydration</p>
          <h1 className="font-bebas text-6xl md:text-8xl uppercase text-white leading-none tracking-tight">Shop</h1>
        </div>
        <div className="flex flex-wrap items-center gap-5 pb-1">
          <span className="text-sm font-semibold uppercase tracking-widest text-white/40 mr-2">Filter</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm uppercase tracking-widest transition-all duration-200 hover-underline ${
                activeCategory === cat ? 'text-white font-black' : 'text-white/60 font-medium hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="text-xs font-semibold uppercase tracking-widest text-white/30 ml-4 hidden sm:block">
            {filteredProducts.length} products
          </span>
        </div>
      </div>

      {/* Product grid */}
      <div className="px-6 md:px-16 py-10">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
          className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12 xl:gap-x-10 xl:gap-y-16"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ShopContent />
    </Suspense>
  );
}
