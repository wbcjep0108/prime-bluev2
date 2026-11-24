'use client';

import type { MouseEvent, ReactNode } from 'react';
import { usePageTransition } from '../TransitionProvider';

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * A real anchor that plays the site's page-transition curtain on a plain click.
 * New-tab and modified clicks are left to the browser through the real href.
 */
export default function TransitionLink({ href, children, className }: TransitionLinkProps) {
  const { navigateTo } = usePageTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigateTo(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
