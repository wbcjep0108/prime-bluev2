'use client';

import { useEffect, useRef } from 'react';

/**
 * Lightweight custom cursor for fine-pointer devices.
 * - Pointer events: none
 * - No React re-renders on mouse move (uses refs + direct DOM style updates)
 */
export default function CustomCursor() {
  const cursorElRef = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const clickableRef = useRef(false);
  const downRef = useRef(false);

  useEffect(() => {
    const el = cursorElRef.current;
    if (!el) return;

    const setClickable = (next: boolean) => {
      if (clickableRef.current === next) return;
      clickableRef.current = next;
      el.classList.toggle('prime-custom-cursor--clickable', next);
    };

    const setDown = (next: boolean) => {
      if (downRef.current === next) return;
      downRef.current = next;
      el.classList.toggle('prime-custom-cursor--down', next);
    };

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;

      // Detect whether we are hovering a "clickable" element.
      const node = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const clickableEl = node?.closest(
        'a,button,[role="button"],[role="link"],input,textarea,select,[data-clickable="true"],.cursor-pointer'
      ) as HTMLElement | null;

      setClickable(Boolean(clickableEl));
    };

    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    const tick = () => {
      const c = current.current;
      const t = target.current;
      // Smooth follow
      c.x += (t.x - c.x) * 0.18;
      c.y += (t.y - c.y) * 0.18;

      el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) translate3d(-50%, -50%, 0)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={cursorElRef}
      className="prime-custom-cursor"
      aria-hidden
    >
      <div className="prime-custom-cursor__circle" />
    </div>
  );
}

