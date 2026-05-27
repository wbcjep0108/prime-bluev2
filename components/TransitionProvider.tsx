'use client';

import { createContext, useContext, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

type Ctx = { navigateTo: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigateTo: () => {} });
export const usePageTransition = () => useContext(TransitionContext);

type CurtainState = 'hidden' | 'entering' | 'holding' | 'exit-text' | 'exiting';

const WORDS = ['PRIME', 'HYDRATION'];
const LETTER_DELAY = 55;  // ms stagger per letter
const LETTER_DUR   = 460; // ms per letter animation
const WORD_GAP_MS  = 80;  // extra gap between words

// Build flat list of {word, char, charIdx, absoluteIdx} for stagger
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
    // 1 — curtain slides up from below
    setState('entering');
    await delay(1400); // curtain covers + all letters appear

    // 2 — navigate while hidden
    setState('holding');
    router.push(href);
    await delay(300);

    // 3 — letters slide back DOWN (reverse pop)
    setState('exit-text');
    await delay(TOTAL_STAGGER + 100); // wait for all letters to retract

    // 4 — curtain slides off to top
    setState('exiting');
    await delay(1050);

    setState('hidden');
  }, [router]);

  // Curtain panel position
  const curtainTransform =
    state === 'hidden'     ? 'translateY(100%)' :
    state === 'entering'   ? 'translateY(0%)'   :
    state === 'holding'    ? 'translateY(0%)'   :
    state === 'exit-text'  ? 'translateY(0%)'   :
    /* exiting */            'translateY(-100%)';

  const curtainTransition =
    state === 'entering' ? 'transform 1.0s cubic-bezier(0.76,0,0.24,1)' :
    state === 'exiting'  ? 'transform 1.0s cubic-bezier(0.76,0,0.24,1)' :
    'none';

  const curtainStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 500,
    backgroundColor: '#000',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '0.25rem',
    pointerEvents: state === 'hidden' ? 'none' : 'all',
    opacity: state === 'hidden' ? 0 : 1,
    transform: curtainTransform,
    transition: curtainTransition,
  };

  // Reconstruct per-word layout from ALL_CHARS
  let charCursor = 0;
  return (
    <TransitionContext.Provider value={{ navigateTo }}>
      {children}

      <div style={curtainStyle} aria-hidden>
        {WORDS.map((word, wordIdx) => {
          const wordChars = ALL_CHARS.slice(charCursor, charCursor + word.length);
          charCursor += word.length;

          return (
            <div key={word} style={{
              display: 'flex',
              fontFamily: 'var(--font-bebas, sans-serif)',
              fontSize: 'clamp(3.5rem, 10vw, 9rem)',
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}>
              {wordChars.map(({ char, absIdx }, ci) => {
                const enterDelay = absIdx * LETTER_DELAY + 180; // letter pops up
                // Exit: reverse order — last letter exits first
                const totalChars = ALL_CHARS.length;
                const reverseIdx = (totalChars - 1) - absIdx;
                const exitDelay  = reverseIdx * LETTER_DELAY + 80;

                const letterTransform =
                  state === 'entering' || state === 'holding' ? 'translateY(0%)' :
                  state === 'exit-text' || state === 'exiting' ? 'translateY(-105%)' :
                  /* hidden */ 'translateY(105%)';

                const letterTransition =
                  state === 'entering'  ? `transform ${LETTER_DUR}ms cubic-bezier(0.76,0,0.24,1) ${enterDelay}ms` :
                  state === 'exit-text' ? `transform ${LETTER_DUR}ms cubic-bezier(0.76,0,0.24,1) ${exitDelay}ms` :
                  'none';

                return (
                  <div key={ci} style={{ overflow: 'hidden', display: 'inline-block' }}>
                    <span style={{
                      display: 'inline-block',
                      transform: letterTransform,
                      transition: letterTransition,
                      // No opacity — pure Y clip reveal
                    }}>
                      {char}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </TransitionContext.Provider>
  );
}

function delay(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}
