'use client';

import { createContext, useContext, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

type Ctx = { navigateTo: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigateTo: () => {} });
export const usePageTransition = () => useContext(TransitionContext);

type CurtainState = 'hidden' | 'entering' | 'holding' | 'exit-text' | 'exiting';

// 5 vertical stripes — all pure black as requested
const STRIPE_COLORS = [
  '#000000',
  '#000000',
  '#000000',
  '#000000',
  '#000000',
];
const N_STRIPES = STRIPE_COLORS.length;

// Stagger timing (ms) between consecutive stripes
const STRIPE_STAGGER    = 80;
// Duration of each stripe sliding in / out
const STRIPE_SLIDE_DUR  = 700;
// Total time until last stripe is fully in
const ENTER_TOTAL = STRIPE_STAGGER * (N_STRIPES - 1) + STRIPE_SLIDE_DUR;
// After routing, pause briefly before sliding out
const HOLD_MS = 300;
// Exit: reverse order stagger
const EXIT_TOTAL  = STRIPE_STAGGER * (N_STRIPES - 1) + STRIPE_SLIDE_DUR;

const WORDS = ['PRIME', 'HYDRATION'];
const LETTER_DELAY = 55;
const LETTER_DUR   = 460;
const WORD_GAP_MS  = 80;

function buildChars() {
  const chars: { word: string; char: string; charIdx: number; absIdx: number }[] = [];
  let abs = 0;
  WORDS.forEach((word, wi) => {
    word.split('').forEach((char, ci) => {
      chars.push({ word, char, charIdx: ci, absIdx: abs + Math.floor(wi * WORD_GAP_MS / LETTER_DELAY) });
      abs++;
    });
  });
  return chars;
}
const ALL_CHARS = buildChars();
const TOTAL_STAGGER = ALL_CHARS[ALL_CHARS.length - 1].absIdx * LETTER_DELAY + LETTER_DUR;

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<CurtainState>('hidden');

  const navigateTo = useCallback(async (href: string) => {
    // 1 — stripes slide up one by one from bottom
    setState('entering');
    await delay(ENTER_TOTAL + 100);

    // 2 — navigate while covered
    setState('holding');
    router.push(href);
    await delay(HOLD_MS);

    // 3 — letters retract
    setState('exit-text');
    await delay(TOTAL_STAGGER + 100);

    // 4 — stripes slide off to top one by one
    setState('exiting');
    await delay(EXIT_TOTAL + 120);

    setState('hidden');
  }, [router]);

  // Label text opacity — visible whenever transition is active
  const showText = state !== 'hidden';

  let charCursor = 0;

  return (
    <TransitionContext.Provider value={{ navigateTo }}>
      {children}

      {/* Overlay container — invisible when hidden to avoid blocking clicks */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 500,
          pointerEvents: state === 'hidden' ? 'none' : 'all',
          opacity: state === 'hidden' ? 0 : 1,
          // No transition on opacity — instant hide/show
        }}
      >
        {/* ── Stripes — each slides up independently ── */}
        {STRIPE_COLORS.map((color, i) => {
          // Enter: left-to-right stagger
          const enterDelay = i * STRIPE_STAGGER;
          // Exit: right-to-left stagger (reverse index)
          const exitDelay = (N_STRIPES - 1 - i) * STRIPE_STAGGER;

          const translateY =
            state === 'hidden'
              ? 'translateY(100%)'
              : state === 'entering'
              ? 'translateY(0%)'
              : state === 'holding' || state === 'exit-text'
              ? 'translateY(0%)'
              : /* exiting */ 'translateY(-100%)';

          const transition =
            state === 'entering'
              ? `transform ${STRIPE_SLIDE_DUR}ms cubic-bezier(0.76,0,0.24,1) ${enterDelay}ms`
              : state === 'exiting'
              ? `transform ${STRIPE_SLIDE_DUR}ms cubic-bezier(0.76,0,0.24,1) ${exitDelay}ms`
              : 'none';

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${(i / N_STRIPES) * 100}%`,
                width: `${100 / N_STRIPES}%`,
                backgroundColor: color,
                transform: translateY,
                transition,
                // Subtle white edge to make the individual dark columns visible as they slide up/down
                boxShadow: i > 0 ? 'inset 1px 0 0 rgba(255, 255, 255, 0.05)' : undefined,
              }}
            />
          );
        })}

        {/* ── PRIME / HYDRATION text on top of stripes ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            opacity: showText ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          {WORDS.map((word) => {
            const wordChars = ALL_CHARS.slice(charCursor, charCursor + word.length);
            charCursor += word.length;

            return (
              <div
                key={word}
                style={{
                  display: 'flex',
                  fontFamily: 'var(--font-bebas, sans-serif)',
                  fontSize: 'clamp(3.5rem, 10vw, 9rem)',
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                }}
              >
                {wordChars.map(({ char, absIdx }, ci) => {
                  const enterDelay = absIdx * LETTER_DELAY + 180;
                  const totalChars = ALL_CHARS.length;
                  const reverseIdx = (totalChars - 1) - absIdx;
                  const exitDelay  = reverseIdx * LETTER_DELAY + 80;

                  const letterTransform =
                    state === 'entering' || state === 'holding'
                      ? 'translateY(0%)'
                      : state === 'exit-text' || state === 'exiting'
                      ? 'translateY(-105%)'
                      : 'translateY(105%)';

                  const letterTransition =
                    state === 'entering'
                      ? `transform ${LETTER_DUR}ms cubic-bezier(0.76,0,0.24,1) ${enterDelay}ms`
                      : state === 'exit-text'
                      ? `transform ${LETTER_DUR}ms cubic-bezier(0.76,0,0.24,1) ${exitDelay}ms`
                      : 'none';

                  return (
                    <div key={ci} style={{ overflow: 'hidden', display: 'inline-block' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          transform: letterTransform,
                          transition: letterTransition,
                        }}
                      >
                        {char}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

function delay(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}
