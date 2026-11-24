import { API_BASE_URL } from '../api/config';
import type {
  AuthErrorCode,
  AuthFailure,
  AuthResult,
  AuthUser,
  GoogleAuthMode,
  LoginFormData,
  RegisterFormData,
  SessionResult,
} from './types';

export const AUTH_ENDPOINTS = {
  register: `${API_BASE_URL}/auth/register`,
  login: `${API_BASE_URL}/auth/login`,
  google: `${API_BASE_URL}/auth/google`,
  logout: `${API_BASE_URL}/auth/logout`,
  me: `${API_BASE_URL}/auth/me`,
} as const;

const NETWORK_MESSAGE = 'Could not reach the server. Check your connection and try again.';
const SERVER_MESSAGE = 'Something went wrong on our side. Please try again.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

type RequestOutcome =
  | { kind: 'response'; status: number; ok: boolean; body: unknown }
  | { kind: 'network' };

/**
 * The only place in the frontend that calls fetch. The session lives in an
 * httpOnly cookie, so every call sends credentials and no token is ever read here.
 */
async function request(url: string, init: { method: 'GET' | 'POST'; body?: unknown }): Promise<RequestOutcome> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: init.method,
      credentials: 'include',
      headers: init.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    return { kind: 'network' };
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Empty or non-JSON body. Handled by the callers through the status code.
  }
  return { kind: 'response', status: response.status, ok: response.ok, body };
}

function codeForStatus(status: number): AuthErrorCode {
  if (status === 400) return 'VALIDATION';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status >= 500) return 'SERVER';
  return 'UNKNOWN';
}

function messageFromBody(body: unknown): string | null {
  if (typeof body === 'object' && body !== null) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return null;
}

function userFromBody(body: unknown): AuthUser | null {
  if (typeof body !== 'object' || body === null) return null;
  const user = (body as { user?: unknown }).user;
  if (typeof user !== 'object' || user === null) return null;
  const { id, name, email } = user as Record<string, unknown>;
  if (typeof id === 'string' && typeof name === 'string' && typeof email === 'string') {
    return { id, name, email };
  }
  return null;
}

/** Maps the server's { status: 'error', message } shape into an AuthFailure. */
function toFailure(outcome: RequestOutcome): AuthFailure {
  if (outcome.kind === 'network') {
    return { ok: false, code: 'NETWORK', message: NETWORK_MESSAGE };
  }
  const code = codeForStatus(outcome.status);
  // Server errors are never shown verbatim. Everything else carries a message
  // the server wrote for the user.
  const message =
    code === 'SERVER' ? SERVER_MESSAGE : (messageFromBody(outcome.body) ?? GENERIC_MESSAGE);
  return { ok: false, code, message };
}

export async function submitLogin(data: LoginFormData): Promise<AuthResult> {
  const outcome = await request(AUTH_ENDPOINTS.login, {
    method: 'POST',
    body: { email: data.email, password: data.password },
  });
  if (outcome.kind === 'response' && outcome.ok) {
    const user = userFromBody(outcome.body);
    if (user) return { ok: true, user };
    return { ok: false, code: 'UNKNOWN', message: GENERIC_MESSAGE };
  }
  return toFailure(outcome);
}

export async function submitRegister(data: RegisterFormData): Promise<AuthResult> {
  const outcome = await request(AUTH_ENDPOINTS.register, {
    method: 'POST',
    // The server names this field "name". The confirmation never leaves the browser.
    body: { name: data.fullName, email: data.email, password: data.password },
  });
  if (outcome.kind === 'response' && outcome.ok) {
    const user = userFromBody(outcome.body);
    if (user) {
      return { ok: true, user, message: 'Your account has been created. You can now log in.' };
    }
    return { ok: false, code: 'UNKNOWN', message: GENERIC_MESSAGE };
  }
  return toFailure(outcome);
}

/**
 * Sends a Google ID token to the server, which verifies it. The browser never
 * trusts the token itself. "login" starts a session, "register" creates the
 * account and does not (same as email registration).
 */
export async function submitGoogle(credential: string, mode: GoogleAuthMode): Promise<AuthResult> {
  const outcome = await request(AUTH_ENDPOINTS.google, {
    method: 'POST',
    body: { credential, mode },
  });
  if (outcome.kind === 'response' && outcome.ok) {
    const user = userFromBody(outcome.body);
    if (!user) return { ok: false, code: 'UNKNOWN', message: GENERIC_MESSAGE };
    return mode === 'register'
      ? { ok: true, user, message: 'Your account has been created. You can now log in.' }
      : { ok: true, user };
  }
  return toFailure(outcome);
}

/** Asks the server who is logged in. A 401 means nobody is. */
export async function getCurrentUser(): Promise<SessionResult> {
  const outcome = await request(AUTH_ENDPOINTS.me, { method: 'GET' });
  if (outcome.kind === 'response' && outcome.ok) {
    const user = userFromBody(outcome.body);
    if (user) return { ok: true, user };
    return { ok: false, code: 'UNKNOWN', message: GENERIC_MESSAGE };
  }
  return toFailure(outcome);
}

export async function submitLogout(): Promise<AuthResult> {
  const outcome = await request(AUTH_ENDPOINTS.logout, { method: 'POST' });
  if (outcome.kind === 'response' && outcome.ok) {
    return { ok: true };
  }
  return toFailure(outcome);
}
