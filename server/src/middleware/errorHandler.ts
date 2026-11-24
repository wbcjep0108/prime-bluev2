import type { ErrorRequestHandler, RequestHandler } from 'express';
import { env } from '../config/env.js';

export type FieldErrors = Record<string, string>;

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** Per-field messages. Only set for validation failures. */
    public readonly fieldErrors?: FieldErrors,
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

  // body-parser reports unparseable JSON with this type. Its own message
  // describes parser internals, so replace it with a fixed one.
  const isMalformedJson = (err as { type?: unknown } | null)?.type === 'entity.parse.failed';

  // Never leak internals for unexpected errors.
  const message = isMalformedJson
    ? 'Invalid JSON body'
    : status >= 500 && env.nodeEnv === 'production'
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : 'Internal server error';

  const fieldErrors = err instanceof HttpError ? err.fieldErrors : undefined;

  res.status(status).json(
    fieldErrors ? { status: 'error', message, fieldErrors } : { status: 'error', message },
  );
};
