// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AccountView from './AccountView';
import type { AuthResult, SessionResult } from '../../lib/auth/types';

const { navigateTo, getCurrentUserMock, submitLogoutMock } = vi.hoisted(() => ({
  navigateTo: vi.fn(),
  getCurrentUserMock: vi.fn(),
  submitLogoutMock: vi.fn(),
}));

vi.mock('../TransitionProvider', () => ({
  usePageTransition: () => ({ navigateTo }),
}));
// The real Navbar samples the page with browser APIs that jsdom lacks.
vi.mock('../Navbar', () => ({ default: () => null }));
// No test may reach the network.
vi.mock('../../lib/auth/api', () => ({
  getCurrentUser: getCurrentUserMock,
  submitLogout: submitLogoutMock,
}));

afterEach(cleanup);
beforeEach(() => {
  navigateTo.mockClear();
  getCurrentUserMock.mockReset();
  submitLogoutMock.mockReset();
});

const USER = { id: 'abc123', name: 'Jo Doe', email: 'jo@example.com' };

const loggedIn: SessionResult = { ok: true, user: USER };
const notLoggedIn: SessionResult = {
  ok: false,
  code: 'UNAUTHORIZED',
  message: 'Authentication required',
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('AccountView', () => {
  describe('loading', () => {
    it('shows a loading state, with no user data and no choices, until the server answers', async () => {
      const pending = deferred<SessionResult>();
      getCurrentUserMock.mockReturnValue(pending.promise);
      render(<AccountView />);

      expect(screen.getByRole('status').textContent).toMatch(/loading your account/i);
      expect(screen.queryByRole('button', { name: /log out/i })).toBeNull();
      expect(screen.queryByText(/not logged in/i)).toBeNull();
      expect(getCurrentUserMock).toHaveBeenCalledTimes(1);

      pending.resolve(loggedIn);
      await screen.findByText('Jo Doe');
      expect(screen.queryByRole('status')).toBeNull();
    });
  });

  describe('logged in', () => {
    beforeEach(() => getCurrentUserMock.mockResolvedValue(loggedIn));

    it('shows the name and email from the server and a Log out button', async () => {
      render(<AccountView />);

      expect(await screen.findByText('Jo Doe')).toBeTruthy();
      expect(screen.getByText('jo@example.com')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Log out' })).toBeTruthy();
      expect(screen.queryByText(/not logged in/i)).toBeNull();
    });

    it('puts Log out below the details, in a stacked footer with the prompt above it', async () => {
      render(<AccountView />);

      const email = await screen.findByText('jo@example.com');
      const logout = screen.getByRole('button', { name: 'Log out' });
      const prompt = screen.getByText('Done for now?');

      // The prompt and the action are separate lines in one centered column.
      expect(prompt.parentElement).toBe(logout.parentElement);
      expect(logout.parentElement?.className).toContain('flex-col');
      expect(logout.parentElement?.className).toContain('items-center');
      expect(prompt.compareDocumentPosition(logout) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      // The footer comes after the user's details in the page.
      expect(email.compareDocumentPosition(prompt) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('logs out and goes to /login', async () => {
      submitLogoutMock.mockResolvedValue({ ok: true } satisfies AuthResult);
      render(<AccountView />);

      fireEvent.click(await screen.findByRole('button', { name: 'Log out' }));

      await waitFor(() => expect(navigateTo).toHaveBeenCalledWith('/login'));
      expect(submitLogoutMock).toHaveBeenCalledTimes(1);
      expect(navigateTo).toHaveBeenCalledTimes(1);
    });

    it('shows a logging-out state and ignores a second click', async () => {
      const pending = deferred<AuthResult>();
      submitLogoutMock.mockReturnValue(pending.promise);
      render(<AccountView />);

      fireEvent.click(await screen.findByRole('button', { name: 'Log out' }));

      const busy = await screen.findByRole('button', { name: /logging out/i });
      expect((busy as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(busy);
      expect(submitLogoutMock).toHaveBeenCalledTimes(1);

      pending.resolve({ ok: true });
      await waitFor(() => expect(navigateTo).toHaveBeenCalledWith('/login'));
    });

    it('still goes to /login when the session had already expired (401)', async () => {
      submitLogoutMock.mockResolvedValue(notLoggedIn);
      render(<AccountView />);

      fireEvent.click(await screen.findByRole('button', { name: 'Log out' }));

      await waitFor(() => expect(navigateTo).toHaveBeenCalledWith('/login'));
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('stays on the page and shows an error if logout could not reach the server', async () => {
      submitLogoutMock.mockResolvedValue({
        ok: false,
        code: 'NETWORK',
        message: 'Could not reach the server. Check your connection and try again.',
      } satisfies AuthResult);
      render(<AccountView />);

      fireEvent.click(await screen.findByRole('button', { name: 'Log out' }));

      const alert = await screen.findByRole('alert');
      expect(alert.textContent).toMatch(/could not reach the server/i);
      expect(navigateTo).not.toHaveBeenCalled();
      expect((screen.getByRole('button', { name: 'Log out' }) as HTMLButtonElement).disabled).toBe(false);
    });
  });

  describe('logged out', () => {
    beforeEach(() => getCurrentUserMock.mockResolvedValue(notLoggedIn));

    it('says so, links to /login and /register, and never shows user data', async () => {
      render(<AccountView />);

      expect(await screen.findByText('You are not logged in')).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Log in' }).getAttribute('href')).toBe('/login');
      expect(screen.getByRole('link', { name: 'Create an account' }).getAttribute('href')).toBe(
        '/register',
      );
      expect(screen.queryByRole('button', { name: /log out/i })).toBeNull();
      expect(screen.queryByText('Jo Doe')).toBeNull();
      expect(screen.queryByText('jo@example.com')).toBeNull();
    });

    it('uses the page transition for those links', async () => {
      render(<AccountView />);

      fireEvent.click(await screen.findByRole('link', { name: 'Log in' }));
      expect(navigateTo).toHaveBeenCalledWith('/login');

      fireEvent.click(screen.getByRole('link', { name: 'Create an account' }));
      expect(navigateTo).toHaveBeenCalledWith('/register');
    });
  });

  describe('server unreachable', () => {
    it('does not claim you are logged out, and lets you try again', async () => {
      getCurrentUserMock.mockResolvedValueOnce({
        ok: false,
        code: 'NETWORK',
        message: 'Could not reach the server. Check your connection and try again.',
      } satisfies SessionResult);
      render(<AccountView />);

      const alert = await screen.findByRole('alert');
      expect(alert.textContent).toMatch(/could not reach the server/i);
      expect(screen.queryByText(/not logged in/i)).toBeNull();

      getCurrentUserMock.mockResolvedValueOnce(loggedIn);
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

      expect(await screen.findByText('Jo Doe')).toBeTruthy();
      expect(getCurrentUserMock).toHaveBeenCalledTimes(2);
    });

    it('treats a server error the same way', async () => {
      getCurrentUserMock.mockResolvedValue({
        ok: false,
        code: 'SERVER',
        message: 'Something went wrong on our side. Please try again.',
      } satisfies SessionResult);
      render(<AccountView />);

      await screen.findByRole('alert');
      expect(screen.queryByText(/not logged in/i)).toBeNull();
    });
  });
});
