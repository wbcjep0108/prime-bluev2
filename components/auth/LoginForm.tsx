'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import AuthShell from './AuthShell';
import FormAlert from './FormAlert';
import GoogleButton from './GoogleButton';
import PasswordField from './PasswordField';
import TextField from './TextField';
import { usePageTransition } from '../TransitionProvider';
import { submitGoogle, submitLogin } from '../../lib/auth/api';
import type {
  AuthResult,
  GoogleCredentialHandler,
  LoginFieldErrors,
  LoginFormData,
  LoginSubmitHandler,
} from '../../lib/auth/types';
import {
  hasErrors,
  validateEmail,
  validateLogin,
  validateLoginPassword,
} from '../../lib/auth/validation';

interface LoginFormProps {
  /** Injected so the UI never calls the API directly. Defaults to the real API call. */
  onSubmit?: LoginSubmitHandler;
  /** Receives the Google ID token. Defaults to the real API call in "login" mode. */
  onGoogle?: GoogleCredentialHandler;
}

const INITIAL_VALUES: LoginFormData = { email: '', password: '' };
const AFTER_LOGIN_PATH = '/';

const loginWithGoogle: GoogleCredentialHandler = (credential) => submitGoogle(credential, 'login');

export default function LoginForm({ onSubmit = submitLogin, onGoogle = loginWithGoogle }: LoginFormProps) {
  const { navigateTo } = usePageTransition();
  const [values, setValues] = useState<LoginFormData>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof LoginFormData) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));

    // Once a field has shown an error, re-check it as the user types.
    if (errors[field]) {
      const message = field === 'email' ? validateEmail(value) : validateLoginPassword(value);
      setErrors((prev) => ({ ...prev, [field]: message }));
    }
  };

  // Shared by email and Google sign-in: one loading state, one error area, one redirect.
  const run = async (action: () => Promise<AuthResult>) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setFormError(null);

    let redirecting = false;
    try {
      const result = await action();
      if (result.ok) {
        // Stay in the loading state while the page-transition curtain plays,
        // so the form cannot be submitted a second time.
        redirecting = true;
        navigateTo(AFTER_LOGIN_PATH);
      } else {
        setFormError(result.message);
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      if (!redirecting) {
        submittingRef.current = false;
        setSubmitting(false);
      }
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const data: LoginFormData = { email: values.email.trim(), password: values.password };
    const nextErrors = validateLogin(data);
    setErrors(nextErrors);
    setFormError(null);

    if (hasErrors(nextErrors)) {
      if (nextErrors.email) emailRef.current?.focus();
      else passwordRef.current?.focus();
      return;
    }

    void run(() => onSubmit(data));
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back. Enter your details to continue."
      switchPrompt="New to Prime?"
      switchLabel="Create an account"
      switchHref="/register"
    >
      <form noValidate onSubmit={handleSubmit} aria-busy={submitting} className="flex flex-col gap-5">
        <FormAlert variant="error" message={formError} />

        <TextField
          id="login-email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange('email')}
          error={errors.email}
          inputRef={emailRef}
        />

        <div className="flex flex-col gap-2">
          <PasswordField
            id="login-password"
            name="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            value={values.password}
            onChange={handleChange('password')}
            error={errors.password}
            inputRef={passwordRef}
          />
          <p className="text-sm text-white/40">
            Forgot password? <span>Coming soon</span>
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-all duration-300 hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
        >
          {submitting ? (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"
            />
          ) : null}
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <GoogleButton
        disabled={submitting}
        onCredential={(credential) => void run(() => onGoogle(credential))}
        onError={setFormError}
        text="signin_with"
      />
    </AuthShell>
  );
}
