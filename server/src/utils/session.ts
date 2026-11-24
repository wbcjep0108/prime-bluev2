import type { CookieOptions, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const SESSION_COOKIE_NAME = 'prime_session';

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

// Lax in development, Secure in production. httpOnly keeps the token out of
// reach of page scripts. The same attributes must be used to clear the cookie.
function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/',
  };
}

export function signSessionToken(userId: string): string {
  return jwt.sign({}, env.jwtSecret, {
    algorithm: 'HS256',
    subject: userId,
    expiresIn: SESSION_MAX_AGE_SECONDS,
  });
}

/** Returns the user id from a valid, unexpired token, or null for anything else. */
export function verifySessionToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
    if (typeof payload === 'object' && typeof payload.sub === 'string') {
      return payload.sub;
    }
    return null;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: SESSION_MAX_AGE_SECONDS * 1000,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, baseCookieOptions());
}
