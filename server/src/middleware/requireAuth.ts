import type { RequestHandler, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { HttpError } from './errorHandler.js';
import { SESSION_COOKIE_NAME, clearSessionCookie, verifySessionToken } from '../utils/session.js';

const AUTH_REQUIRED_MESSAGE = 'Authentication required';

/**
 * Reads the session cookie and verifies it. On success the user id is stored on
 * res.locals for the handler. Otherwise responds 401 and clears a bad cookie.
 */
export const requireAuth: RequestHandler = (req, res, next) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE_NAME];

  if (typeof token !== 'string' || !token) {
    next(new HttpError(401, AUTH_REQUIRED_MESSAGE));
    return;
  }

  const userId = verifySessionToken(token);
  if (!userId || !isValidObjectId(userId)) {
    clearSessionCookie(res);
    next(new HttpError(401, AUTH_REQUIRED_MESSAGE));
    return;
  }

  res.locals.authUserId = userId;
  next();
};

/** Typed read of the id that requireAuth stored. Only call after requireAuth. */
export function getAuthUserId(res: Response): string {
  return res.locals.authUserId as string;
}
