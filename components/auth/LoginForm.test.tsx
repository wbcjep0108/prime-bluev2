// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm';
import type { AuthResult, LoginFormData } from '../../lib/auth/types';

const { navigateTo, submitLoginMock, submitGoogleMock } = vi.hoisted(() => ({
  navigateTo: vi.fn(),
  submitLoginMock: vi.fn(),
  submitGoogleMock: vi.fn(),
}));

vi.mock('../TransitionProvider', () => ({
  usePageTransition: () => ({ navigateTo }),
}));
// The real Navbar samples the page with browser APIs that jsdom lacks.
vi.mock('../Navbar', () => ({ default: () => null }));
// No test may reach the network. The default handler is the mocked api function.
vi.mock('../../lib/auth/api', () => ({
  submitLogin: submitLoginMock,
  submitGoogle: submitGoogleMock,
}));
// Stands in for the Google script and its button. Clicking it delivers a credential.
vi.mock('./GoogleButton', async () => {
  const { createElement } = await import('react');
  return {
    default: ({
      onCredential,
      disabled,
      text,
    }: {
      onCredential: (c: string) => void;
      disabled?: boolean;
      text?: string;
    }) =>
      createElement(
        'button',
        { type: 'button', disabled, 'data-text': text, onClick: () => onCredential('google-token') },
        'Mock Google',
      ),
  };
});

afterEach(cleanup);
beforeEach(() => {
  navigateTo.mockClear();
  submitLoginMock.mockReset();
  submitGoogleMock.mockReset();
});

const googleButton = () => screen.getByRole('button', { name: 'Mock Google' }) as HTMLButtonElement;

const emailInput = () => screen.getByLabelText('Email', { selector: 'input' }) as HTMLInputElement;
const passwordInput = () => screen.getByLabelText('Password', { selector: 'input' }) as HTMLInputElement;
const submitButton = () => screen.getByRole('button', { name: /log in|logging in/i }) as HTMLButtonElement;

function fill(email: string, password: string) {
  fireEvent.change(emailInput(), { target: { value: email } });
  fireEvent.change(passwordInput(), { target: { value: password } });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('LoginForm', () => {
  it('renders the expected fields and omits remember me', () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(emailInput().type).toBe('email');
    expect(passwordInput().type).toBe('password');
    expect(screen.queryByText(/remember me/i)).toBeNull();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('shows forgot password as inert text, not a link or button', () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Coming soon')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /forgot/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /forgot/i })).toBeNull();
  });

  it('blocks an empty submit, shows required errors and focuses the first invalid field', () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.click(submitButton());

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Enter your email address.')).toBeTruthy();
    expect(screen.getByText('Enter your password.')).toBeTruthy();
    expect(emailInput().getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(emailInput());

    const describedBy = emailInput().getAttribute('aria-describedby');
    expect(describedBy).toBe('login-email-error');
    expect(document.getElementById(describedBy!)?.getAttribute('role')).toBe('alert');
  });

  it('rejects a badly formatted email and focuses the password when only it is invalid', () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fill('not-an-email', 'secret');
    fireEvent.click(submitButton());
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
    expect(document.activeElement).toBe(emailInput());

    fill('user@example.com', '');
    fireEvent.click(submitButton());
    expect(screen.getByText('Enter your password.')).toBeTruthy();
    expect(document.activeElement).toBe(passwordInput());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears a field error once the value becomes valid', () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    fireEvent.click(submitButton());
    expect(screen.getByText('Enter your email address.')).toBeTruthy();

    fireEvent.change(emailInput(), { target: { value: 'user@example.com' } });
    expect(screen.queryByText('Enter your email address.')).toBeNull();
    expect(emailInput().getAttribute('aria-invalid')).toBeNull();
  });

  it('toggles password visibility with an accessible pressed state', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle.getAttribute('type')).toBe('button');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(toggle);
    expect(passwordInput().type).toBe('text');
    const hide = screen.getByRole('button', { name: 'Hide password' });
    expect(hide.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(hide);
    expect(passwordInput().type).toBe('password');
  });

  it('submits trimmed data once when valid', async () => {
    const onSubmit = vi.fn<(data: LoginFormData) => Promise<AuthResult>>().mockResolvedValue({
      ok: false,
      code: 'UNKNOWN',
      message: 'nope',
    });
    render(<LoginForm onSubmit={onSubmit} />);

    fill('  user@example.com  ', 'secret');
    fireEvent.click(submitButton());

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret' });
  });

  it('shows a loading state and ignores repeat submits while pending', async () => {
    const pending = deferred<AuthResult>();
    const onSubmit = vi.fn().mockReturnValue(pending.promise);
    render(<LoginForm onSubmit={onSubmit} />);

    fill('user@example.com', 'secret');
    fireEvent.click(submitButton());

    await waitFor(() => expect(submitButton().disabled).toBe(true));
    expect(submitButton().textContent).toMatch(/logging in/i);
    expect(document.querySelector('form')?.getAttribute('aria-busy')).toBe('true');

    fireEvent.submit(document.querySelector('form')!);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    pending.resolve({ ok: false, code: 'UNKNOWN', message: 'done' });
    await waitFor(() => expect(submitButton().disabled).toBe(false));
  });

  it('shows the message from a failed result in an alert', async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      ok: false,
      code: 'UNKNOWN',
      message: 'Invalid email or password.',
    });
    render(<LoginForm onSubmit={onSubmit} />);

    fill('user@example.com', 'secret');
    fireEvent.click(submitButton());

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Invalid email or password.');
  });

  it('shows a generic error when the handler throws', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('boom'));
    render(<LoginForm onSubmit={onSubmit} />);

    fill('user@example.com', 'secret');
    fireEvent.click(submitButton());

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Something went wrong. Please try again.');
    expect(submitButton().disabled).toBe(false);
  });

  it('uses the api submitLogin by default and shows its failure message', async () => {
    submitLoginMock.mockResolvedValue({
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Invalid email or password',
    });
    render(<LoginForm />);

    fill('user@example.com', 'secret');
    fireEvent.click(submitButton());

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Invalid email or password');
    expect(submitLoginMock).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret' });
    expect(screen.queryByRole('status')).toBeNull();
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('redirects to / through the page transition on success and stays in the loading state', async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      ok: true,
      user: { id: '1', name: 'Jo Doe', email: 'user@example.com' },
    });
    render(<LoginForm onSubmit={onSubmit} />);

    fill('user@example.com', 'secret');
    fireEvent.click(submitButton());

    await waitFor(() => expect(navigateTo).toHaveBeenCalledWith('/'));
    expect(navigateTo).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).toBeNull();

    // The button stays disabled while the curtain plays, so it cannot be resubmitted.
    expect(submitButton().disabled).toBe(true);
    fireEvent.submit(document.querySelector('form')!);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not redirect when the result is a failure', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: false, code: 'UNAUTHORIZED', message: 'Invalid email or password' });
    render(<LoginForm onSubmit={onSubmit} />);

    fill('user@example.com', 'secret');
    fireEvent.click(submitButton());

    await screen.findByRole('alert');
    expect(navigateTo).not.toHaveBeenCalled();
    expect(submitButton().disabled).toBe(false);
  });

  it('links to /register and uses the page transition on a plain click', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    const link = screen.getByRole('link', { name: 'Create an account' });
    expect(link.getAttribute('href')).toBe('/register');

    fireEvent.click(link);
    expect(navigateTo).toHaveBeenCalledWith('/register');
  });

  it('leaves modified clicks to the browser', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    // jsdom cannot navigate. Stop the default only after React has seen the click.
    const stopNavigation = (event: Event) => event.preventDefault();
    document.addEventListener('click', stopNavigation);

    fireEvent.click(screen.getByRole('link', { name: 'Create an account' }), { ctrlKey: true });
    expect(navigateTo).not.toHaveBeenCalled();

    document.removeEventListener('click', stopNavigation);
  });

  describe('Google sign-in', () => {
    it('asks Google to word its button "Sign in with Google"', () => {
      render(<LoginForm onSubmit={vi.fn()} onGoogle={vi.fn()} />);

      expect(googleButton().getAttribute('data-text')).toBe('signin_with');
    });

    it('sends the credential to onGoogle and redirects to / on success', async () => {
      const onGoogle = vi.fn().mockResolvedValue({
        ok: true,
        user: { id: '1', name: 'Jo Doe', email: 'jo@example.com' },
      });
      render(<LoginForm onSubmit={vi.fn()} onGoogle={onGoogle} />);

      fireEvent.click(googleButton());

      await waitFor(() => expect(navigateTo).toHaveBeenCalledWith('/'));
      expect(onGoogle).toHaveBeenCalledWith('google-token');
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('shows the server message and does not redirect when there is no account', async () => {
      const onGoogle = vi.fn().mockResolvedValue({
        ok: false,
        code: 'NOT_FOUND',
        message: 'No account found. Please register first.',
      });
      render(<LoginForm onSubmit={vi.fn()} onGoogle={onGoogle} />);

      fireEvent.click(googleButton());

      const alert = await screen.findByRole('alert');
      expect(alert.textContent).toBe('No account found. Please register first.');
      expect(navigateTo).not.toHaveBeenCalled();
      expect(submitButton().disabled).toBe(false);
    });

    it('shows a generic error when the Google handler throws', async () => {
      const onGoogle = vi.fn().mockRejectedValue(new Error('boom'));
      render(<LoginForm onSubmit={vi.fn()} onGoogle={onGoogle} />);

      fireEvent.click(googleButton());

      const alert = await screen.findByRole('alert');
      expect(alert.textContent).toBe('Something went wrong. Please try again.');
    });

    it('disables both buttons while a Google request is pending, and ignores repeats', async () => {
      const pending = deferred<AuthResult>();
      const onGoogle = vi.fn().mockReturnValue(pending.promise);
      render(<LoginForm onSubmit={vi.fn()} onGoogle={onGoogle} />);

      fireEvent.click(googleButton());

      await waitFor(() => expect(submitButton().disabled).toBe(true));
      expect(googleButton().disabled).toBe(true);
      expect(submitButton().textContent).toMatch(/logging in/i);

      fireEvent.click(googleButton());
      expect(onGoogle).toHaveBeenCalledTimes(1);

      pending.resolve({ ok: false, code: 'UNKNOWN', message: 'done' });
      await waitFor(() => expect(googleButton().disabled).toBe(false));
    });

    it('uses submitGoogle in "login" mode by default', async () => {
      submitGoogleMock.mockResolvedValue({
        ok: false,
        code: 'NOT_FOUND',
        message: 'No account found. Please register first.',
      });
      render(<LoginForm />);

      fireEvent.click(googleButton());

      await screen.findByRole('alert');
      expect(submitGoogleMock).toHaveBeenCalledWith('google-token', 'login');
    });

    it('does not run email validation or submit the email handler', async () => {
      const onSubmit = vi.fn();
      const onGoogle = vi.fn().mockResolvedValue({ ok: false, code: 'UNKNOWN', message: 'x' });
      render(<LoginForm onSubmit={onSubmit} onGoogle={onGoogle} />);

      fireEvent.click(googleButton());

      await screen.findByRole('alert');
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.queryByText('Enter your email address.')).toBeNull();
    });
  });

  it('stacks the footer: "New to Prime?" on its own line above the "Create an account" link', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    const prompt = screen.getByText('New to Prime?');
    const link = screen.getByRole('link', { name: 'Create an account' });

    expect(prompt.parentElement).toBe(link.parentElement);
    expect(link.parentElement?.className).toContain('flex-col');
    expect(link.parentElement?.className).toContain('items-center');
    expect(prompt.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('keeps a logical keyboard order inside a real form', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    const form = document.querySelector('form')!;
    expect(form.hasAttribute('novalidate')).toBe(true);

    const order = Array.from(
      document.querySelectorAll<HTMLElement>('input, button, a[href]'),
    ).map((el) => el.id || el.getAttribute('aria-label') || el.textContent);

    expect(order).toEqual([
      'login-email',
      'login-password',
      'Show password',
      'Log in',
      'Mock Google',
      'Create an account',
    ]);
    expect(submitButton().type).toBe('submit');
  });
});
