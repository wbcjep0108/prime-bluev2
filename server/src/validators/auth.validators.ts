import type { FieldErrors } from '../middleware/errorHandler.js';

// These rules mirror lib/auth/validation.ts on the frontend. The server is the
// source of truth, so it re-checks everything instead of trusting the client.
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 60;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt only uses the first 72 bytes of a password, so longer input is refused. */
export const PASSWORD_MAX_BYTES = 72;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; fieldErrors: FieldErrors };

function asRecord(body: unknown): Record<string, unknown> {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
}

// Values must be strings. This also blocks operator objects such as
// { "$ne": null } from ever reaching a Mongo query.
function checkName(value: unknown): { name?: string; error?: string } {
  if (typeof value !== 'string' || !value.trim()) return { error: 'Enter your full name.' };
  const name = value.trim();
  if (name.length < NAME_MIN_LENGTH) {
    return { error: `Full name must be at least ${NAME_MIN_LENGTH} characters.` };
  }
  if (name.length > NAME_MAX_LENGTH) {
    return { error: `Full name must be ${NAME_MAX_LENGTH} characters or fewer.` };
  }
  return { name };
}

function checkEmail(value: unknown): { email?: string; error?: string } {
  if (typeof value !== 'string' || !value.trim()) return { error: 'Enter your email address.' };
  const email = value.trim().toLowerCase();
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { error: 'Enter a valid email address.' };
  }
  return { email };
}

function checkNewPassword(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return 'Create a password.';
  if (Buffer.byteLength(value, 'utf8') > PASSWORD_MAX_BYTES) {
    return `Password is too long (maximum ${PASSWORD_MAX_BYTES} bytes).`;
  }
  if (
    value.length < PASSWORD_MIN_LENGTH ||
    !/[A-Z]/.test(value) ||
    !/[a-z]/.test(value) ||
    !/\d/.test(value)
  ) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include an uppercase letter, a lowercase letter and a number.`;
  }
  return undefined;
}

export function parseRegisterBody(body: unknown): ParseResult<RegisterInput> {
  const raw = asRecord(body);
  const fieldErrors: FieldErrors = {};

  const nameCheck = checkName(raw.name);
  if (nameCheck.error) fieldErrors.name = nameCheck.error;

  const emailCheck = checkEmail(raw.email);
  if (emailCheck.error) fieldErrors.email = emailCheck.error;

  const passwordError = checkNewPassword(raw.password);
  if (passwordError) fieldErrors.password = passwordError;

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    value: {
      name: nameCheck.name as string,
      email: emailCheck.email as string,
      password: raw.password as string,
    },
  };
}

export const GOOGLE_MODES = ['login', 'register'] as const;
export type GoogleMode = (typeof GOOGLE_MODES)[number];

/** Google ID tokens are a few kilobytes at most. Anything larger is not one. */
export const GOOGLE_CREDENTIAL_MAX_LENGTH = 8192;

export interface GoogleInput {
  credential: string;
  mode: GoogleMode;
}

export function parseGoogleBody(body: unknown): ParseResult<GoogleInput> {
  const raw = asRecord(body);
  const fieldErrors: FieldErrors = {};

  const credential = raw.credential;
  if (typeof credential !== 'string' || !credential.trim()) {
    fieldErrors.credential = 'A Google credential is required.';
  } else if (credential.length > GOOGLE_CREDENTIAL_MAX_LENGTH) {
    fieldErrors.credential = 'The Google credential is invalid.';
  }

  const mode = raw.mode;
  if (typeof mode !== 'string' || !(GOOGLE_MODES as readonly string[]).includes(mode)) {
    fieldErrors.mode = 'Mode must be "login" or "register".';
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    value: { credential: (credential as string).trim(), mode: mode as GoogleMode },
  };
}

/** Login checks presence and type only. Complexity rules apply when creating a password. */
export function parseLoginBody(body: unknown): ParseResult<LoginInput> {
  const raw = asRecord(body);
  const fieldErrors: FieldErrors = {};

  const emailCheck = checkEmail(raw.email);
  if (emailCheck.error) fieldErrors.email = emailCheck.error;

  if (typeof raw.password !== 'string' || !raw.password) {
    fieldErrors.password = 'Enter your password.';
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    value: { email: emailCheck.email as string, password: raw.password as string },
  };
}
