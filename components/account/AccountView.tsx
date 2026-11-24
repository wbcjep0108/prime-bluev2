'use client';

import { useCallback, useEffect, useState } from 'react';
import AuthShell from '../auth/AuthShell';
import FormAlert from '../auth/FormAlert';
import TransitionLink from '../auth/TransitionLink';
import { usePageTransition } from '../TransitionProvider';
import { getCurrentUser, submitLogout } from '../../lib/auth/api';
import type { AuthUser } from '../../lib/auth/types';

type AccountState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated' }
  | { status: 'error'; message: string };

const PRIMARY_BUTTON_CLASS =
  'flex w-full items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-all duration-300 hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100';

const SECONDARY_BUTTON_CLASS =
  'flex w-full items-center justify-center rounded-full border border-white/25 px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:border-white hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]';

export default function AccountView() {
  const { navigateTo } = usePageTransition();
  const [state, setState] = useState<AccountState>({ status: 'loading' });
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  // Bumping this re-runs the load, which is how "Try again" works.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setState({ status: 'authenticated', user: result.user });
      } else if (result.code === 'UNAUTHORIZED') {
        setState({ status: 'unauthenticated' });
      } else {
        // The server could not be reached. That is not the same as "not logged in".
        setState({ status: 'error', message: result.message });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError(null);

    const result = await submitLogout();
    // A 401 means the session already ended, which is the outcome we wanted.
    if (result.ok || result.code === 'UNAUTHORIZED') {
      navigateTo('/login');
      // Stay in the loading state while the page-transition curtain plays.
      return;
    }
    setLogoutError(result.message);
    setLoggingOut(false);
  };

  if (state.status === 'loading') {
    return (
      <AuthShell title="Account" subtitle="One moment.">
        <div role="status" className="flex items-center gap-3 text-sm text-white/70">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          />
          Loading your account...
        </div>
      </AuthShell>
    );
  }

  if (state.status === 'authenticated') {
    return (
      <AuthShell title="Account" subtitle="You are logged in.">
        <div className="flex flex-col gap-6">
          <FormAlert variant="error" message={logoutError} />

          <dl className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <dt className="font-bebas text-sm uppercase tracking-[0.2em] text-white/70">Name</dt>
              <dd className="break-words text-base text-white">{state.user.name}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-bebas text-sm uppercase tracking-[0.2em] text-white/70">Email</dt>
              <dd className="break-all text-base text-white">{state.user.email}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-busy={loggingOut}
            className={PRIMARY_BUTTON_CLASS}
          >
            {loggingOut ? (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"
              />
            ) : null}
            {loggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </AuthShell>
    );
  }

  if (state.status === 'unauthenticated') {
    return (
      <AuthShell title="Account" subtitle="You are not logged in">
        <div className="flex flex-col gap-4">
          <TransitionLink href="/login" className={PRIMARY_BUTTON_CLASS}>
            Log in
          </TransitionLink>
          <TransitionLink href="/register" className={SECONDARY_BUTTON_CLASS}>
            Create an account
          </TransitionLink>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Account" subtitle="We could not load your account.">
      <div className="flex flex-col gap-5">
        <FormAlert variant="error" message={state.message} />
        <button type="button" onClick={retry} className={PRIMARY_BUTTON_CLASS}>
          Try again
        </button>
      </div>
    </AuthShell>
  );
}
