'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import AuthShell from './AuthShell';
import FormAlert from './FormAlert';
import GoogleButton from './GoogleButton';
import PasswordField from './PasswordField';
import PasswordRequirements from './PasswordRequirements';
import TextField from './TextField';
import TransitionLink from './TransitionLink';
import { submitGoogle, submitRegister } from '../../lib/auth/api';
import type {
  AuthResult,
  GoogleCredentialHandler,
  RegisterFieldErrors,
  RegisterFormData,
  RegisterSubmitHandler,
} from '../../lib/auth/types';
import {
  hasErrors,
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validateNewPassword,
  validateRegister,
} from '../../lib/auth/validation';

interface RegisterFormProps {
  /** Injected so the UI never calls the API directly. Defaults to the real API call. */
  onSubmit?: RegisterSubmitHandler;
  /** Receives the Google ID token. Defaults to the real API call in "register" mode. */
  onGoogle?: GoogleCredentialHandler;
}

const registerWithGoogle: GoogleCredentialHandler = (credential) => submitGoogle(credential, 'register');

const INITIAL_VALUES: RegisterFormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const REQUIREMENTS_ID = 'register-password-requirements';

function validateField(field: keyof RegisterFormData, values: RegisterFormData): string | undefined {
  switch (field) {
    case 'fullName':
      return validateFullName(values.fullName);
    case 'email':
      return validateEmail(values.email);
    case 'password':
      return validateNewPassword(values.password);
    case 'confirmPassword':
      return validateConfirmPassword(values.password, values.confirmPassword);
  }
}

export default function RegisterForm({
  onSubmit = submitRegister,
  onGoogle = registerWithGoogle,
}: RegisterFormProps) {
  const [values, setValues] = useState<RegisterFormData>(INITIAL_VALUES);
  const [errors, setErrors] = useState<RegisterFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof RegisterFormData) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);

    setErrors((prev) => {
      const updated = { ...prev };
      // Re-check a field as the user types once it has shown an error.
      if (prev[field]) updated[field] = validateField(field, next);
      // The match check depends on the password, so keep it in sync.
      if (field === 'password' && next.confirmPassword) {
        updated.confirmPassword = validateField('confirmPassword', next);
      }
      return updated;
    });
  };

  // Validate on blur, but leave "required" messages for submit so tabbing
  // through the form does not flood it with errors.
  const handleBlur = (field: keyof RegisterFormData) => () => {
    if (!values[field]) return;
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values) }));
  };

  // Shared by email and Google registration: one loading state, one error
  // area, one success state.
  const run = async (action: () => Promise<AuthResult>) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const result = await action();
      if (result.ok) {
        // Registration does not sign the person in. Show the message and a link to log in.
        setFormSuccess(result.message ?? 'Your account has been created. You can now log in.');
      } else {
        setFormError(result.message);
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const data: RegisterFormData = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      password: values.password,
      confirmPassword: values.confirmPassword,
    };
    const nextErrors = validateRegister(data);
    setErrors(nextErrors);
    setFormError(null);
    setFormSuccess(null);

    if (hasErrors(nextErrors)) {
      const order: [keyof RegisterFormData, typeof fullNameRef][] = [
        ['fullName', fullNameRef],
        ['email', emailRef],
        ['password', passwordRef],
        ['confirmPassword', confirmPasswordRef],
      ];
      const firstInvalid = order.find(([field]) => nextErrors[field]);
      firstInvalid?.[1].current?.focus();
      return;
    }

    void run(() => onSubmit(data));
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Join Prime. It only takes a minute."
      switchPrompt="Already have an account?"
      switchLabel="Log in"
      switchHref="/login"
    >
      {formSuccess ? (
        <div className="flex flex-col gap-5">
          <FormAlert variant="success" message={formSuccess} />
          <TransitionLink
            href="/login"
            className="flex w-full items-center justify-center rounded-full bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-black transition-all duration-300 hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
          >
            Continue to log in
          </TransitionLink>
        </div>
      ) : (
      <form noValidate onSubmit={handleSubmit} aria-busy={submitting} className="flex flex-col gap-5">
        <FormAlert variant="error" message={formError} />

        <TextField
          id="register-name"
          name="fullName"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          value={values.fullName}
          onChange={handleChange('fullName')}
          onBlur={handleBlur('fullName')}
          error={errors.fullName}
          inputRef={fullNameRef}
        />

        <TextField
          id="register-email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          error={errors.email}
          inputRef={emailRef}
        />

        <div className="flex flex-col gap-3">
          <PasswordField
            id="register-password"
            name="password"
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={values.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            error={errors.password}
            describedBy={REQUIREMENTS_ID}
            inputRef={passwordRef}
          />
          <PasswordRequirements id={REQUIREMENTS_ID} password={values.password} />
        </div>

        <PasswordField
          id="register-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={values.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          error={errors.confirmPassword}
          inputRef={confirmPasswordRef}
        />

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
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      )}

      {formSuccess ? null : (
        <GoogleButton
          disabled={submitting}
          onCredential={(credential) => void run(() => onGoogle(credential))}
          onError={setFormError}
          text="signup_with"
        />
      )}
    </AuthShell>
  );
}
