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

/** Which wording the button uses. Login uses "signin_with", register "signup_with". */
export type GoogleButtonText = 'continue_with' | 'signin_with' | 'signup_with';

const LABELS: Record<GoogleButtonText, string> = {
  continue_with: 'Continue with Google',
  signin_with: 'Sign in with Google',
  signup_with: 'Sign up with Google',
};

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

// The visible face is as tall as the Log In button (16px text line plus 28px
// padding). Google's "large" button is 40px tall, so the invisible copy is
// stretched vertically to cover the whole face. Clicks map back correctly
// through the transform.
const FACE_HEIGHT = 44;
const GOOGLE_BUTTON_HEIGHT = 40;

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

/** Google's official multicolor "G", unmodified. Decorative: the label carries the meaning. */
function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 48 48"
      width="18"
      height="18"
      className="shrink-0"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

interface GoogleButtonProps {
  /** Called with the Google ID token. The server, not this component, verifies it. */
  onCredential: (credential: string) => void;
  /** Called if the Google script fails to load. */
  onError?: (message: string) => void;
  /** Dims the button and blocks clicks while a sign-in request is already running. */
  disabled?: boolean;
  /** Defaults to NEXT_PUBLIC_GOOGLE_CLIENT_ID. */
  clientId?: string;
  /**
   * The wording. It sets the visible label ("Sign in with Google" for login,
   * "Sign up with Google" for register) and the text of the hidden Google button.
   */
  text?: GoogleButtonText;
}

/**
 * Renders the "or" divider and a sign-in button that looks like the Log In
 * button. What the visitor sees is our own face (white pill, Google's "G", a
 * label). On top of it sits Google's real Identity Services button, drawn by
 * Google and almost fully transparent, so every click, tap and key press goes
 * to the real thing and Google still produces the credential. Renders nothing
 * at all when no client ID is configured.
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

  const label = LABELS[text];

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
        role="group"
        aria-label={label}
        aria-disabled={disabled || undefined}
        className={cn(
          'group relative h-11 w-full rounded-full',
          'focus-within:ring-2 focus-within:ring-[#00E5FF] focus-within:ring-offset-2 focus-within:ring-offset-[#080808]',
          disabled ? 'cursor-not-allowed' : undefined,
        )}
      >
        {/* The visible face. Same text classes and hover effect as the Log In button. */}
        <div
          data-google-face=""
          aria-hidden="true"
          className={cn(
            'flex h-full w-full items-center justify-center gap-3 rounded-full bg-white px-7',
            'text-xs font-bold uppercase tracking-widest text-black transition-all duration-300',
            disabled ? 'opacity-60' : 'group-hover:scale-[1.02] group-active:scale-95',
          )}
        >
          <GoogleLogo />
          <span>{label}</span>
        </div>

        {/* Google's real button, on top, almost invisible. It is the click target. */}
        <div
          data-google-overlay=""
          className={cn(
            'absolute inset-0 z-10 cursor-pointer overflow-hidden rounded-full opacity-[0.01]',
            disabled ? 'pointer-events-none' : undefined,
          )}
        >
          <div
            ref={containerRef}
            style={{
              height: GOOGLE_BUTTON_HEIGHT,
              transform: `scaleY(${FACE_HEIGHT / GOOGLE_BUTTON_HEIGHT})`,
              transformOrigin: 'top left',
            }}
          />
        </div>
      </div>
    </div>
  );
}
