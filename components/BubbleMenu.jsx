'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './BubbleMenu.css';

const DEFAULT_ITEMS = [
  { label: 'Home',  href: '/',     ariaLabel: 'Home',  rotation: -6, hoverStyles: { bgColor: 'rgba(0,102,255,0.3)', textColor: '#ffffff' } },
  { label: 'Shop',  href: '/shop', ariaLabel: 'Shop',  rotation:  6, hoverStyles: { bgColor: 'rgba(0,102,255,0.3)', textColor: '#ffffff' } },
  { label: 'About', href: '#about',ariaLabel: 'About', rotation: -4, hoverStyles: { bgColor: 'rgba(0,102,255,0.3)', textColor: '#ffffff' } },
];

export default function BubbleMenu({
  logo,
  onMenuClick = undefined,
  className = '',
  style = {},
  menuAriaLabel = 'Toggle menu',
  menuBg = 'rgba(255,255,255,0.1)',
  menuContentColor = '#ffffff',
  useFixedPosition = true,
  initialOpen = false,
  items,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.45,
  staggerDelay = 0.1,
}) {
  const [isMenuOpen, setIsMenuOpen]   = useState(initialOpen);
  const [showOverlay, setShowOverlay] = useState(initialOpen);

  const overlayRef  = useRef(null);
  const bubblesRef  = useRef([]);
  const labelRefs   = useRef([]);

  const menuItems = items?.length ? items : DEFAULT_ITEMS;
  const containerClassName = [
    'bubble-menu',
    useFixedPosition ? 'fixed' : 'absolute',
    className,
  ].filter(Boolean).join(' ');

  const handleToggle = () => {
    const next = !isMenuOpen;
    if (next) setShowOverlay(true);
    setIsMenuOpen(next);
    onMenuClick?.(next);
  };

  // Animate bubbles in/out
  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels  = labelRefs.current.filter(Boolean);
    if (!overlay || !bubbles.length) return;

    if (isMenuOpen) {
      gsap.set(overlay, { display: 'flex', autoAlpha: 0 });
      gsap.to(overlay, { autoAlpha: 1, duration: 0.25 });
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(labels,  { y: 28, autoAlpha: 0 });

      bubbles.forEach((bubble, i) => {
        const delay = i * staggerDelay + gsap.utils.random(-0.03, 0.03);
        const tl = gsap.timeline({ delay });
        tl.to(bubble, { scale: 1, duration: animationDuration, ease: animationEase });
        if (labels[i]) {
          tl.to(labels[i], { y: 0, autoAlpha: 1, duration: animationDuration, ease: 'power3.out' },
            `-=${animationDuration * 0.9}`);
        }
      });
    } else if (showOverlay) {
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.to(labels,  { y: 28, autoAlpha: 0, duration: 0.18, ease: 'power3.in' });
      gsap.to(bubbles, {
        scale: 0, duration: 0.18, ease: 'power3.in',
        onComplete: () => {
          gsap.to(overlay, {
            autoAlpha: 0, duration: 0.2,
            onComplete: () => {
              gsap.set(overlay, { display: 'none' });
              setShowOverlay(false);
            }
          });
        }
      });
    }
  }, [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isMenuOpen) handleToggle(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  return (
    <>
      <nav className={containerClassName} style={style} aria-label="Main navigation">
        {/* Logo pill */}
        <div
          className="bubble logo-bubble"
          style={{
            background: menuBg,
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
            opacity: isMenuOpen ? 0 : 1,
            pointerEvents: isMenuOpen ? 'none' : 'auto',
            transition: 'opacity 0.25s ease',
          }}
        >
          <span className="logo-content">
            {typeof logo === 'string'
              ? <img src={logo} alt="Logo" className="bubble-logo" />
              : logo}
          </span>
        </div>

        {/* Toggle button */}
        <button
          type="button"
          className={`bubble toggle-bubble menu-btn ${isMenuOpen ? 'open' : ''}`}
          onClick={handleToggle}
          aria-label={menuAriaLabel}
          aria-pressed={isMenuOpen}
          style={{ background: menuBg, backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <span className="menu-line" style={{ background: menuContentColor }} />
          <span className="menu-line" style={{ background: menuContentColor }} />
        </button>
      </nav>

      {showOverlay && (
        <div
          ref={overlayRef}
          className={`bubble-menu-items ${useFixedPosition ? 'fixed' : 'absolute'}`}
          aria-hidden={!isMenuOpen}
          onClick={(e) => { if (e.target === e.currentTarget) handleToggle(); }}
        >
          <ul className="pill-list" role="menu" aria-label="Menu links">
            {menuItems.map((item, idx) => (
              <li key={idx} role="none" className="pill-col">
                <a
                  role="menuitem"
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  className="pill-link"
                  style={{
                    '--item-rot':    `${item.rotation ?? 0}deg`,
                    '--pill-bg':     'rgba(255,255,255,0.05)',
                    '--pill-color':  '#ffffff',
                    '--hover-bg':    item.hoverStyles?.bgColor  || 'rgba(0,102,255,0.3)',
                    '--hover-color': item.hoverStyles?.textColor || '#ffffff',
                  }}
                  ref={el => { if (el) bubblesRef.current[idx] = el; }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span
                    className="pill-label"
                    ref={el => { if (el) labelRefs.current[idx] = el; }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
