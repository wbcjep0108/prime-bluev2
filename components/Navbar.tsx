'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { usePageTransition } from './TransitionProvider';

const navLinks = [
  { label: 'Home',  href: '/' },
  { label: 'Shop',  href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Account', href: '/account' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [theme, setTheme]         = useState<'dark' | 'light'>('dark');
  const { navigateTo }            = usePageTransition();
  const navRef                    = useRef<HTMLElement>(null);
  const rafRef                    = useRef<number | null>(null);

  // ── adaptive theme ────────────────────────────────────────────────────────
  const sampleTheme = useCallback(() => {
    const x = window.innerWidth / 2;
    const y = 28;
    const elements = document.elementsFromPoint(x, y);
    for (const el of elements) {
      if (navRef.current && (navRef.current === el || navRef.current.contains(el))) continue;
      const bg = window.getComputedStyle(el).backgroundColor;
      if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
      const match = bg.match(/[\d.]+/g);
      if (!match || match.length < 3) continue;
      const r = parseFloat(match[0]);
      const g = parseFloat(match[1]);
      const b = parseFloat(match[2]);
      const a = match[4] ? parseFloat(match[4]) : 1;
      if (a < 0.05) continue;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      setTheme(luminance > 0.45 ? 'light' : 'dark');
      return;
    }
  }, []);

  useEffect(() => {
    let lastChecked = 0;
    const onScroll = () => {
      const now = Date.now();
      if (now - lastChecked < 200) return;
      lastChecked = now;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(sampleTheme);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const t = setTimeout(sampleTheme, 300);
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(t);
    };
  }, [sampleTheme]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  const textColor = theme === 'light' ? '#000' : '#fff';
  const burgerBg  = theme === 'light' ? 'bg-black' : 'bg-white';

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div
        className="relative flex items-center justify-between px-6 md:px-12 py-4 transition-colors duration-500"
        style={{ color: textColor, mixBlendMode: 'difference' }}
      >
        {/* Brand */}
        <a href="/" className="flex items-center" style={{ color: 'inherit' }}>
          <span
            className="text-lg font-sans font-medium tracking-[0.25em] uppercase leading-none transition-colors duration-500"
            style={{ color: 'inherit' }}
          >
            PRIME
          </span>
        </a>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <button
                onClick={() => navigateTo(link.href)}
                className="text-[11px] font-medium uppercase tracking-[0.2em] hover-underline transition-all duration-500 opacity-100"
                style={{ color: 'inherit' }}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="md:hidden flex flex-col gap-1.5 p-1"
        >
          <span className={`block w-6 h-0.5 ${burgerBg} transition-all duration-500 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 ${burgerBg} transition-all duration-500 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 ${burgerBg} transition-all duration-500 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Dropdown — glassmorphism style with centered text */}
      <motion.div
        initial={false}
        animate={{ height: menuOpen ? 'auto' : 0, opacity: menuOpen ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="md:hidden overflow-hidden bg-black/30 backdrop-blur-lg border-t border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)]"
      >
        <ul className="flex flex-col px-8 py-6 gap-6">
          {navLinks.map((link) => (
            <li key={link.label} className="w-full flex justify-center">
              <button
                onClick={() => { setMenuOpen(false); navigateTo(link.href); }}
                className="relative text-center text-white text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300 hover:text-[#00E5FF] active:text-[#00E5FF] flex items-center justify-center gap-3 group py-1"
              >
                <span className="w-1 h-1 rounded-full bg-[#00E5FF] opacity-0 group-hover:opacity-100 group-active:opacity-100 shadow-[0_0_8px_#00E5FF] transition-all duration-300 transform scale-0 group-hover:scale-100" />
                <span className="transition-transform duration-300 group-hover:scale-105">{link.label}</span>
                <span className="w-1 h-1 rounded-full bg-[#00E5FF] opacity-0 group-hover:opacity-100 group-active:opacity-100 shadow-[0_0_8px_#00E5FF] transition-all duration-300 transform scale-0 group-hover:scale-100" />
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.nav>
  );
}
