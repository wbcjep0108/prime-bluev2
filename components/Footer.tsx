'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { productData } from '../data/product';
import { usePageTransition } from './TransitionProvider';

const footerLinks = {
  'Prime Hydration': [
    { label: 'Our Story',        href: '#' },
    { label: 'All Flavors',      href: '/shop?category=All' },
    { label: 'Energy Series',    href: '/shop?category=Energy' },
    { label: 'Limited Editions', href: '#' },
  ],
  'Shop': [
    { label: 'Shop Now',         href: '/shop' },
    { label: 'Subscribe & Save', href: '#' },
    { label: 'Retail Locator',   href: '#' },
  ],
  'Connect': [
    { label: 'Instagram',        href: 'https://www.instagram.com/drinkprime/' },
    { label: 'Facebook',         href: 'https://www.facebook.com/p/DrinkPrime-100076456194119/' },
    { label: 'YouTube',          href: 'https://www.youtube.com/@primedrink5306' },
    { label: 'Twitter / X',      href: 'https://x.com/PrimeHydrate' },
  ],
};

export default function Footer() {
  const { navigateTo } = usePageTransition();
  const contentRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const inView = useInView(contentRef, { once: true, margin: '-10% 0px' });
  const wordmarkInView = useInView(wordmarkRef, { once: false, margin: '0px 0px' });

  return (
    <footer className="relative w-full text-black">

      {/* ── Dark zone: big PRIME wordmark ── */}
      <div
        ref={wordmarkRef}
        className="bg-[#080808] px-6 md:px-10 select-none overflow-hidden flex justify-center items-end"
        style={{ height: 'clamp(60px, 27vw, 460px)' }}
      >
        <motion.div
          className="font-sans font-extrabold text-white text-center leading-none tracking-[-0.08em]"
          animate={wordmarkInView ? { y: '7%' } : { y: '100%' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          style={{
            fontSize: 'clamp(80px, 37vw, 650px)',
            lineHeight: 0.7,
          }}
        >
          PRIME
        </motion.div>
      </div>

      {/* ── White zone: content ── */}
      <div className="bg-white">
        {/* Divider */}
        <div className="mx-6 md:mx-10 border-t border-black/10" />

        {/* ── Content ── */}
        <div
          ref={contentRef}
          className="px-6 md:px-10 py-14 grid grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_1fr] gap-10"
        >
          {/* Tagline + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
            className="col-span-2 md:col-span-1 flex flex-col gap-5"
          >
            <div>
              <p className="font-bebas text-xs uppercase tracking-[0.3em] text-black font-semibold mb-1">Prime Hydration</p>
              <h2 className="font-bebas text-3xl md:text-4xl uppercase leading-tight text-black">
                Stay in the game.<br />Stay hydrated.
              </h2>
            </div>
            <button
              onClick={() => navigateTo('/shop')}
              className="self-start bg-black text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black/75 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              {productData.price} Shop Now
            </button>
          </motion.div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([category, links], i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1], delay: 0.12 + i * 0.08 }}
            >
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <button
                        onClick={() => navigateTo(link.href)}
                        className="relative inline-block text-sm text-black font-semibold tracking-wide text-left after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-100"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="relative inline-block text-sm text-black font-semibold tracking-wide after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-100"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </footer>
  );
}
