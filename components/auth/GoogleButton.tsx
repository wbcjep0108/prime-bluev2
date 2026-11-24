'use client';

import { useCallback, useEffect, useRef } from 'react';
import Script from 'next/script';
import { GOOGLE_CLIENT_ID } from '../../lib/api/config';
import { cn } from '../../lib/utils';

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client?hl=en';
const LOAD_ERROR_MESSAGE = 'Google sign-in could not be loaded. Please use your email instead.';

// Minimal typing for the part of Google Identity Services this component uses.
interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdApi {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type: 'standard';
      theme: 'outline' | 'filled_blue' | 'filled_black';
      size: 'large' | 'medium' | 'small';
      text: GoogleButtonText;
      shape: 'pill' | 'rectangular';
      width: number;
      locale: string;
    },
  ) => void;
}

/** The label Google prints on its button. Login uses "signin_with", register "signup_with". */
export type GoogleButtonText = 'continue_with' | 'signin_with' | 'signup_with';

type GoogleWindow = Window & { google?: { accounts?: { id?: GoogleIdApi } } };

// Google asks for initialize() to be called once per page. These live at module
// level so navigating between /login and /register does not initialise twice.
// "initializedFor" is the API object it was last called on, which also lets a
// reloaded script start fresh.
let initializedFor: unknown = null;
let activeHandler: ((credential: string) => void) | null = null;

function getGoogleApi(): GoogleIdApi | null {
  if (typeof window === 'undefined') return null;
  return (window as GoogleWindow).google?.accounts?.id ?? null;
}

const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

/** Google sizes its button in pixels, so use the width the form gives the container. */
function widthFor(container: HTMLElement): number {
  const measured = Math.round(container.clientWidth);
  return measured > 0 ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, measured)) : DEFAULT_WIDTH;
}

/** Draws Google's button into the container. Returns the width used, or null if nothing was drawn. */
function drawButton(
  container: HTMLElement | null,
  clientId: string,
  text: GoogleButtonText,
): number | null {
  const api = getGoogleApi();
  if (!api || !container) return null;

  if (initializedFor !== api) {
    api.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) activeHandler?.(response.credential);
      },
    });
    initializedFor = api;
  }

  const width = widthFor(container);

  api.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text,
    shape: 'pill',
    width,
    locale: 'en',
  });
  return width;
}

interface GoogleButtonProps {
  /** Called with the Google ID token. The server, not this component, verifies it. */
  onCredential: (credential: string) => void;
  /** Called if the Google script fails to load. */
  onError?: (message: string) => void;
  /** Blocks clicks while a sign-in request is already running. */
  disabled?: boolean;
  /** Defaults to NEXT_PUBLIC_GOOGLE_CLIENT_ID. */
  clientId?: string;
  /** Wording on Google's button: "signin_with" for login, "signup_with" for register. */
  text?: GoogleButtonText;
}

/**
 * Renders the "or" divider and Google's own sign-in button (Google Identity
 * Services). The button is drawn by Google. This component only provides the
 * container and loads the script, and it renders nothing at all when no client
 * ID is configured.
 */
export default function GoogleButton({
  onCredential,
  onError,
  disabled = false,
  clientId = GOOGLE_CLIENT_ID,
  text = 'signin_with',
}: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const credentialRef = useRef(onCredential);
  // Width of the button Google last drew, so a resize only redraws when it matters.
  const drawnWidthRef = useRef<number | null>(null);

  useEffect(() => {
    credentialRef.current = onCredential;
  }, [onCredential]);

  // Route Google's single callback to whichever instance is mounted.
  useEffect(() => {
    const handler = (credential: string) => credentialRef.current(credential);
    activeHandler = handler;
    return () => {
      if (activeHandler === handler) activeHandler = null;
    };
  }, []);

  const draw = useCallback(() => {
    if (!clientId) return;
    const width = drawButton(containerRef.current, clientId, text);
    if (width !== null) drawnWidthRef.current = width;
  }, [clientId, text]);

  // The script may already be on the page from an earlier visit to this form.
  useEffect(() => {
    draw();
  }, [draw]);

  // Google's button has a fixed pixel width, so redraw it if the card changes
  // size (a rotated phone, a resized window) to keep it matching the card.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      if (drawnWidthRef.current !== null && widthFor(container) !== drawnWidthRef.current) {
        draw();
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw, clientId]);

  if (!clientId) return null;

  return (
    <div className="mt-6 flex flex-col gap-5">
      <Script
        id="google-identity-services"
        src={GSI_SCRIPT_SRC}
        strategy="afterInteractive"
        onReady={draw}
        onError={() => onError?.(LOAD_ERROR_MESSAGE)}
      />

      <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-white/40">
        <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
        or
        <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
      </div>

      <div
        ref={containerRef}
        role="group"
        aria-label="Continue with Google"
        aria-disabled={disabled || undefined}
        className={cn(
          'flex min-h-[44px] justify-center transition-opacity duration-300',
          disabled ? 'pointer-events-none opacity-60' : undefined,
        )}
      />
    </div>
  );
}
