'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Navbar from '../Navbar';
import TransitionLink from './TransitionLink';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** The three switch-link props go together. Omit all of them for no footer link. */
  switchPrompt?: string;
  switchLabel?: string;
  switchHref?: string;
}

export default function AuthShell({
  title,
  subtitle,
  children,
  switchPrompt,
  switchLabel,
  switchHref,
}: AuthShellProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-white selection:text-black">
      <Navbar />

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-28 md:px-12">
        {/* Decorative glow, matches the brand blue */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primeBlue/20 blur-[140px]"
        />

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm md:p-10"
        >
          <header className="mb-8">
            <h1 className="font-bebas text-5xl uppercase leading-[0.95] tracking-tight text-white md:text-6xl">
              {title}
            </h1>
            <div className="mb-4 mt-5 h-[2px] w-12 bg-white" />
            <p className="text-sm leading-relaxed text-white/60 md:text-base">{subtitle}</p>
          </header>

          {children}

          {switchHref && switchLabel ? (
            <p className="mt-8 text-center text-sm text-white/60">
              {switchPrompt}{' '}
              <TransitionLink
                href={switchHref}
                className="hover-underline font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]/60"
              >
                {switchLabel}
              </TransitionLink>
            </p>
          ) : null}
        </motion.section>
      </main>
    </div>
  );
}
