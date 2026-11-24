import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AUTH_ENDPOINTS,
  getCurrentUser,
  submitGoogle,
  submitLogin,
  submitLogout,
  submitRegister,
} from './api';

const fetchMock = vi.fn();

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const USER = { id: 'abc123', name: 'Jo Doe', email: 'jo@example.com' };

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('endpoints', () => {
  it('are built from the API base URL under /auth', () => {
    expect(AUTH_ENDPOINTS.login.endsWith('/auth/login')).toBe(true);
    expect(AUTH_ENDPOINTS.google.endsWith('/auth/google')).toBe(true);
    expect(AUTH_ENDPOINTS.register.endsWith('/auth/register')).toBe(true);
    expect(AUTH_ENDPOINTS.logout.endsWith('/auth/logout')).toBe(true);
    expect(AUTH_ENDPOINTS.me.endsWith('/auth/me')).toBe(true);
  });
});

describe('submitLogin', () => {
  it('posts JSON with credentials included and returns the user', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { user: USER }));

    const result = await submitLogin({ email: 'jo@example.com', password: 'Abcdefg1' });

    expect(result).toEqual({ ok: true, user: USER });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(AUTH_ENDPOINTS.login);
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({ email: 'jo@example.com', password: 'Abcdefg1' });
  });

  it('maps a 401 to UNAUTHORIZED with the server message', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, { status: 'error', message: 'Invalid email or password' }),
    );

    expect(await submitLogin({ email: 'a@b.co', password: 'x' })).toEqual({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Invalid email or password',
    });
  });

  it('treats a success response without a user as a failure, never as success', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { unexpected: true }));

    const result = await submitLogin({ email: 'a@b.co', password: 'x' });
    expect(result.ok).toBe(false);
  });
});

describe('submitRegister', () => {
  it('sends name, email and password only, never the confirmation', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { user: USER }));

    const result = await submitRegister({
      fullName: 'Jo Doe',
      email: 'jo@example.com',
      password: 'Abcdefg1',
      confirmPassword: 'Abcdefg1',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user).toEqual(USER);
      expect(result.message).toMatch(/can now log in/i);
    }
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(AUTH_ENDPOINTS.register);
    expect(init.credentials).toBe('include');
    expect(JSON.parse(init.body)).toEqual({
      name: 'Jo Doe',
      email: 'jo@example.com',
      password: 'Abcdefg1',
    });
  });

  it('maps a 409 to CONFLICT with the server message', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(409, { status: 'error', message: 'An account with this email already exists' }),
    );

    const result = await submitRegister({
      fullName: 'Jo Doe',
      email: 'jo@example.com',
      password: 'Abcdefg1',
      confirmPassword: 'Abcdefg1',
    });
    expect(result).toEqual({
      ok: false,
      code: 'CONFLICT',
      message: 'An account with this email already exists',
    });
  });

  it('maps a 400 with fieldErrors to VALIDATION using the form-level message', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, {
        status: 'error',
        message: 'Please check the form and try again.',
        fieldErrors: { email: 'Enter a valid email address.' },
      }),
    );

    const result = await submitRegister({
      fullName: 'Jo Doe',
      email: 'bad',
      password: 'Abcdefg1',
      confirmPassword: 'Abcdefg1',
    });
    expect(result).toEqual({
      ok: false,
      code: 'VALIDATION',
      message: 'Please check the form and try again.',
    });
  });
});

describe('submitGoogle', () => {
  it('posts the credential and mode with credentials included', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { user: USER }));

    await submitGoogle('google-id-token', 'login');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(AUTH_ENDPOINTS.google);
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({ credential: 'google-id-token', mode: 'login' });
  });

  it('login success returns the user and no registration message', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { user: USER }));

    expect(await submitGoogle('t', 'login')).toEqual({ ok: true, user: USER });
  });

  it('register success returns the user and a message pointing to log in', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { user: USER }));

    const result = await submitGoogle('t', 'register');

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).mode).toBe('register');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user).toEqual(USER);
      expect(result.message).toMatch(/can now log in/i);
    }
  });

  it('maps a 404 to NOT_FOUND with the server message', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(404, { status: 'error', message: 'No account found. Please register first.' }),
    );

    expect(await submitGoogle('t', 'login')).toEqual({
      ok: false,
      code: 'NOT_FOUND',
      message: 'No account found. Please register first.',
    });
  });

  it('maps a 409 to CONFLICT with the server message', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(409, {
        status: 'error',
        message: 'An account with this email already exists. Please log in.',
      }),
    );

    expect(await submitGoogle('t', 'register')).toEqual({
      ok: false,
      code: 'CONFLICT',
      message: 'An account with this email already exists. Please log in.',
    });
  });

  it('maps a 401 to UNAUTHORIZED with the server message', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, { status: 'error', message: 'Google sign-in failed. Please try again.' }),
    );

    expect(await submitGoogle('t', 'login')).toEqual({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Google sign-in failed. Please try again.',
    });
  });

  it('reports a network failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    expect(await submitGoogle('t', 'login')).toMatchObject({ ok: false, code: 'NETWORK' });
  });

  it('never treats a success response without a user as success', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { unexpected: true }));

    expect((await submitGoogle('t', 'login')).ok).toBe(false);
  });
});

describe('error mapping', () => {
  it('hides server error messages behind a fixed message for 5xx', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(500, { status: 'error', message: 'E11000 stack trace details' }),
    );

    const result = await submitLogin({ email: 'a@b.co', password: 'x' });
    expect(result).toEqual({
      ok: false,
      code: 'SERVER',
      message: 'Something went wrong on our side. Please try again.',
    });
  });

  it('reports a network failure when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await submitLogin({ email: 'a@b.co', password: 'x' });
    expect(result).toMatchObject({ ok: false, code: 'NETWORK' });
  });

  it('falls back to a generic message for a non-JSON error body', async () => {
    fetchMock.mockResolvedValue(new Response('<html>bad gateway</html>', { status: 404 }));

    const result = await submitLogin({ email: 'a@b.co', password: 'x' });
    expect(result).toEqual({
      ok: false,
      code: 'NOT_FOUND',
      message: 'Something went wrong. Please try again.',
    });
  });
});

describe('getCurrentUser', () => {
  it('sends a credentialed GET with no body and returns the user', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { user: USER }));

    expect(await getCurrentUser()).toEqual({ ok: true, user: USER });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(AUTH_ENDPOINTS.me);
    expect(init.method).toBe('GET');
    expect(init.credentials).toBe('include');
    expect(init.body).toBeUndefined();
  });

  it('maps a 401 to UNAUTHORIZED', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, { status: 'error', message: 'Authentication required' }),
    );

    expect(await getCurrentUser()).toMatchObject({ ok: false, code: 'UNAUTHORIZED' });
  });
});

describe('submitLogout', () => {
  it('posts with credentials and reports success', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { message: 'Logged out' }));

    expect(await submitLogout()).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(AUTH_ENDPOINTS.logout);
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
  });

  it('maps a 401 to UNAUTHORIZED', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, { status: 'error', message: 'Authentication required' }),
    );

    expect(await submitLogout()).toMatchObject({ ok: false, code: 'UNAUTHORIZED' });
  });
});
