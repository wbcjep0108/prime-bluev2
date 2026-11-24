import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '../validators/auth.validators.js';

export interface GoogleIdentity {
  /** Stable Google account id (the "sub" claim). */
  googleId: string;
  /** Lowercase, trimmed, and confirmed verified by Google. */
  email: string;
  name: string;
}

const GOOGLE_FAILED_MESSAGE = 'Google sign-in failed. Please try again.';
const FALLBACK_NAME = 'Prime User';

// No client secret is involved. An ID token is checked against Google's public
// keys, and the audience must be this app's client ID.
const client = new OAuth2Client(env.googleClientId);

function deriveName(name: string | undefined, givenName: string | undefined, email: string): string {
  const candidate = (name ?? givenName ?? email.split('@')[0] ?? '').trim().slice(0, NAME_MAX_LENGTH).trim();
  return candidate.length >= NAME_MIN_LENGTH ? candidate : FALLBACK_NAME;
}

/**
 * Verifies a Google ID token and returns the identity inside it. Every failure
 * (bad signature, wrong audience, expired, unverified email) becomes the same
 * 401, so the response does not help someone probing the endpoint.
 */
export async function verifyGoogleCredential(credential: string): Promise<GoogleIdentity> {
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, GOOGLE_FAILED_MESSAGE);
  }

  if (!payload || !payload.sub || !payload.email || payload.email_verified !== true) {
    throw new HttpError(401, GOOGLE_FAILED_MESSAGE);
  }

  const email = payload.email.trim().toLowerCase();
  return {
    googleId: payload.sub,
    email,
    name: deriveName(payload.name, payload.given_name, email),
  };
}
