import type { ErrorRequestHandler, RequestHandler } from 'express';
import { env } from '../config/env.js';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Express identifies error middleware by its 4-argument signature.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status =
    err instanceof HttpError
      ? err.status
      : typeof err?.status === 'number' && err.status >= 400 && err.status < 600
        ? err.status
        : 500;

  if (status >= 500) {
    console.error('[error]', err);
  }

  // Never leak internals for unexpected errors.
  const message =
    status >= 500 && env.nodeEnv === 'production'
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Internal server error';

  res.status(status).json({ status: 'error', message });
};
