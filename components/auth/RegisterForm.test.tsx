// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import RegisterForm from './RegisterForm';
import type { AuthResult } from '../../lib/auth/types';

const { navigateTo, submitRegisterMock, submitGoogleMock } = vi.hoisted(() => ({
  navigateTo: vi.fn(),
  submitRegisterMock: vi.fn(),
  submitGoogleMock: vi.fn(),
}));

vi.mock('../TransitionProvider', () => ({
  usePageTransition: () => ({ navigateTo }),
}));
// The real Navbar samples the page with browser APIs that jsdom lacks.
vi.mock('../Navbar', () => ({ default: () => null }));
// No test may reach the network. The default handler is the mocked api function.
vi.mock('../../lib/auth/api', () => ({
  submitRegister: submitRegisterMock,
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
  submitRegisterMock.mockReset();
  submitGoogleMock.mockReset();
});

const googleButton = () => screen.queryByRole('button', { name: 'Mock Google' }) as HTMLButtonElement | null;

const input = (label: string) => screen.getByLabelText(label, { selector: 'input' }) as HTMLInputElement;
const nameInput = () => input('Full name');
const emailInput = () => input('Email');
const passwordInput = () => input('Password');
const confirmInput = () => input('Confirm password');
const submitButton = () =>
  screen.getByRole('button', { name: /create account|creating account/i }) as HTMLButtonElement;

const VALID = {
  fullName: 'Jo Doe',
  email: 'jo@example.com',
  password: 'Abcdefg1',
  confirmPassword: 'Abcdefg1',
};

function fillAll(values = VALID) {
  fireEvent.change(nameInput(), { target: { value: values.fullName } });
  fireEvent.change(emailInput(), { target: { value: values.email } });
  fireEvent.change(passwordInput(), { target: { value: values.password } });
  fireEvent.change(confirmInput(), { target: { value: values.confirmPassword } });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const ruleState = () =>
  Array.from(document.querySelectorAll('#register-password-requirements li')).map(
    (li) => li.getAttribute('data-met') === 'true',
  );

describe('RegisterForm', () => {
  it('renders all fields and omits the terms checkbox', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);
    expect(nameInput()).toBeTruthy();
    expect(emailInput().type).toBe('email');
    expect(passwordInput().type).toBe('password');
    expect(confirmInput().type).toBe('password');
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(screen.queryByText(/terms/i)).toBeNull();
  });

  it('blocks an empty submit, shows required errors and focuses the first invalid field', () => {
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);

    fireEvent.click(submitButton());

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Enter your full name.')).toBeTruthy();
    expect(screen.getByText('Enter your email address.')).toBeTruthy();
    expect(screen.getByText('Create a password.')).toBeTruthy();
    expect(screen.getByText('Confirm your password.')).toBeTruthy();
    expect(nameInput().getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(nameInput());
  });

  it('focuses the first invalid field when earlier fields are valid', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    fillAll({ ...VALID, email: 'bad' });
    fireEvent.click(submitButton());
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
    expect(document.activeElement).toBe(emailInput());
  });

  it('updates the live password checklist as the user types', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    // Order: length, uppercase, lowercase, number
    expect(ruleState()).toEqual([false, false, false, false]);

    fireEvent.change(passwordInput(), { target: { value: 'abc' } });
    expect(ruleState()).toEqual([false, false, true, false]);

    fireEvent.change(passwordInput(), { target: { value: 'Abcdefg1' } });
    expect(ruleState()).toEqual([true, true, true, true]);
  });

  it('links the checklist to the password field for assistive technology', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);
    expect(passwordInput().getAttribute('aria-describedby')).toContain('register-password-requirements');
    expect(document.getElementById('register-password-requirements')).toBeTruthy();
  });

  it('rejects a password that misses a rule', () => {
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);

    fillAll({ ...VALID, password: 'abcdefgh', confirmPassword: 'abcdefgh' });
    fireEvent.click(submitButton());

    expect(screen.getByText('Password does not meet all the requirements.')).toBeTruthy();
    expect(document.activeElement).toBe(passwordInput());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('validates that the confirmation matches, on blur and on submit', () => {
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);

    fireEvent.change(passwordInput(), { target: { value: 'Abcdefg1' } });
    fireEvent.change(confirmInput(), { target: { value: 'Different1' } });
    fireEvent.blur(confirmInput());
    expect(screen.getByText('Passwords do not match.')).toBeTruthy();

    // Fixing the password side re-checks the match.
    fireEvent.change(passwordInput(), { target: { value: 'Different1' } });
    expect(screen.queryByText('Passwords do not match.')).toBeNull();

    fillAll({ ...VALID, confirmPassword: 'Nope1234' });
    fireEvent.click(submitButton());
    expect(screen.getByText('Passwords do not match.')).toBeTruthy();
    expect(document.activeElement).toBe(confirmInput());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not show a required error just from tabbing through an empty field', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);
    fireEvent.blur(nameInput());
    expect(screen.queryByText('Enter your full name.')).toBeNull();
  });

  it('gives each password field its own independent toggle', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(passwordInput().type).toBe('text');
    expect(confirmInput().type).toBe('password');

    const confirmToggle = screen.getByRole('button', { name: 'Show confirm password' });
    expect(confirmToggle.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(confirmToggle);
    expect(confirmInput().type).toBe('text');
    expect(screen.getByRole('button', { name: 'Hide confirm password' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('submits trimmed data once when valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: false, code: 'UNKNOWN', message: 'nope' });
    render(<RegisterForm onSubmit={onSubmit} />);

    fillAll({ ...VALID, fullName: '  Jo Doe  ', email: '  jo@example.com  ' });
    fireEvent.click(submitButton());

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(VALID);
  });

  it('shows a loading state and ignores repeat submits while pending', async () => {
    const pending = deferred<AuthResult>();
    const onSubmit = vi.fn().mockReturnValue(pending.promise);
    render(<RegisterForm onSubmit={onSubmit} />);

    fillAll();
    fireEvent.click(submitButton());

    await waitFor(() => expect(submitButton().disabled).toBe(true));
    expect(submitButton().textContent).toMatch(/creating account/i);

    fireEvent.submit(document.querySelector('form')!);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    pending.resolve({ ok: false, code: 'UNKNOWN', message: 'done' });
    await waitFor(() => expect(submitButton().disabled).toBe(false));
  });

  it('shows the message from a failed result in an alert', async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      ok: false,
      code: 'UNKNOWN',
      message: 'That email is already registered.',
    });
    render(<RegisterForm onSubmit={onSubmit} />);

    fillAll();
    fireEvent.click(submitButton());

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('That email is already registered.');
  });

  it('shows a generic error when the handler throws', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('boom'));
    render(<RegisterForm onSubmit={onSubmit} />);

    fillAll();
    fireEvent.click(submitButton());

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Something went wrong. Please try again.');
  });

  it('renders the success area and a link to /login only when the handler returns ok: true', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true, message: 'Welcome aboard.' });
    render(<RegisterForm onSubmit={onSubmit} />);

    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Continue to log in' })).toBeNull();

    fillAll();
    fireEvent.click(submitButton());

    const status = await screen.findByRole('status');
    expect(status.textContent).toBe('Welcome aboard.');
    expect(screen.queryByRole('alert')).toBeNull();

    const link = screen.getByRole('link', { name: 'Continue to log in' });
    expect(link.getAttribute('href')).toBe('/login');
    fireEvent.click(link);
    expect(navigateTo).toHaveBeenCalledWith('/login');

    // The form is replaced, so it cannot be submitted again.
    expect(document.querySelector('form')).toBeNull();
  });

  it('uses the api submitRegister by default and shows its failure message', async () => {
    submitRegisterMock.mockResolvedValue({
      ok: false,
      code: 'CONFLICT',
      message: 'An account with this email already exists',
    });
    render(<RegisterForm />);

    fillAll();
    fireEvent.click(submitButton());

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('An account with this email already exists');
    expect(submitRegisterMock).toHaveBeenCalledWith(VALID);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('links to /login and uses the page transition on a plain click', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    const link = screen.getByRole('link', { name: 'Log in' });
    expect(link.getAttribute('href')).toBe('/login');

    fireEvent.click(link);
    expect(navigateTo).toHaveBeenCalledWith('/login');
  });

  describe('Google sign-up', () => {
    it('asks Google to word its button "Sign up with Google"', () => {
      render(<RegisterForm onSubmit={vi.fn()} onGoogle={vi.fn()} />);

      expect(googleButton()!.getAttribute('data-text')).toBe('signup_with');
    });

    it('shows the success message and a link to /login when Google registration succeeds', async () => {
      const onGoogle = vi.fn().mockResolvedValue({
        ok: true,
        user: { id: '1', name: 'Jo Doe', email: 'jo@example.com' },
        message: 'Your account has been created. You can now log in.',
      });
      render(<RegisterForm onSubmit={vi.fn()} onGoogle={onGoogle} />);

      fireEvent.click(googleButton()!);

      const status = await screen.findByRole('status');
      expect(status.textContent).toBe('Your account has been created. You can now log in.');
      expect(onGoogle).toHaveBeenCalledWith('google-token');

      const link = screen.getByRole('link', { name: 'Continue to log in' });
      expect(link.getAttribute('href')).toBe('/login');

      // No automatic login or redirect: registration does not start a session.
      expect(navigateTo).not.toHaveBeenCalled();
      // The form and the Google button are replaced, so nothing can be submitted twice.
      expect(document.querySelector('form')).toBeNull();
      expect(googleButton()).toBeNull();
    });

    it('shows the server message when the email already has an account', async () => {
      const onGoogle = vi.fn().mockResolvedValue({
        ok: false,
        code: 'CONFLICT',
        message: 'An account with this email already exists. Please log in.',
      });
      render(<RegisterForm onSubmit={vi.fn()} onGoogle={onGoogle} />);

      fireEvent.click(googleButton()!);

      const alert = await screen.findByRole('alert');
      expect(alert.textContent).toBe('An account with this email already exists. Please log in.');
      expect(screen.queryByRole('status')).toBeNull();
      expect(document.querySelector('form')).not.toBeNull();
    });

    it('disables both buttons while a Google request is pending, and ignores repeats', async () => {
      const pending = deferred<AuthResult>();
      const onGoogle = vi.fn().mockReturnValue(pending.promise);
      render(<RegisterForm onSubmit={vi.fn()} onGoogle={onGoogle} />);

      fireEvent.click(googleButton()!);

      await waitFor(() => expect(submitButton().disabled).toBe(true));
      expect(googleButton()!.disabled).toBe(true);
      expect(submitButton().textContent).toMatch(/creating account/i);

      fireEvent.click(googleButton()!);
      expect(onGoogle).toHaveBeenCalledTimes(1);

      pending.resolve({ ok: false, code: 'UNKNOWN', message: 'done' });
      await waitFor(() => expect(googleButton()!.disabled).toBe(false));
    });

    it('shows a generic error when the Google handler throws', async () => {
      const onGoogle = vi.fn().mockRejectedValue(new Error('boom'));
      render(<RegisterForm onSubmit={vi.fn()} onGoogle={onGoogle} />);

      fireEvent.click(googleButton()!);

      const alert = await screen.findByRole('alert');
      expect(alert.textContent).toBe('Something went wrong. Please try again.');
    });

    it('uses submitGoogle in "register" mode by default', async () => {
      submitGoogleMock.mockResolvedValue({
        ok: false,
        code: 'CONFLICT',
        message: 'An account with this email already exists. Please log in.',
      });
      render(<RegisterForm />);

      fireEvent.click(googleButton()!);

      await screen.findByRole('alert');
      expect(submitGoogleMock).toHaveBeenCalledWith('google-token', 'register');
    });

    it('does not validate or submit the email form', async () => {
      const onSubmit = vi.fn();
      const onGoogle = vi.fn().mockResolvedValue({ ok: false, code: 'UNKNOWN', message: 'x' });
      render(<RegisterForm onSubmit={onSubmit} onGoogle={onGoogle} />);

      fireEvent.click(googleButton()!);

      await screen.findByRole('alert');
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.queryByText('Enter your full name.')).toBeNull();
    });
  });

  it('stacks the footer: "Already have an account?" on its own line above the "Log in" link', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    const prompt = screen.getByText('Already have an account?');
    const link = screen.getByRole('link', { name: 'Log in' });

    expect(prompt.parentElement).toBe(link.parentElement);
    expect(link.parentElement?.className).toContain('flex-col');
    expect(prompt.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('keeps a logical keyboard order', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    const order = Array.from(
      document.querySelectorAll<HTMLElement>('input, button, a[href]'),
    ).map((el) => el.id || el.getAttribute('aria-label') || el.textContent);

    expect(order).toEqual([
      'register-name',
      'register-email',
      'register-password',
      'Show password',
      'register-confirm-password',
      'Show confirm password',
      'Create account',
      'Mock Google',
      'Log in',
    ]);
  });
});
