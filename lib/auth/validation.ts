import type {
  LoginFieldErrors,
  LoginFormData,
  RegisterFieldErrors,
  RegisterFormData,
} from './types';

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 60;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt on the server only uses the first 72 bytes, so the server refuses longer input. */
export const PASSWORD_MAX_BYTES = 72;

// Pragmatic check: something@something.tld with no whitespace.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface PasswordRule {
  id: 'length' | 'uppercase' | 'lowercase' | 'number';
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (p) => p.length >= PASSWORD_MIN_LENGTH,
  },
  { id: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /\d/.test(p) },
];

export function getPasswordRuleStatus(password: string): { rule: PasswordRule; met: boolean }[] {
  return PASSWORD_RULES.map((rule) => ({ rule, met: rule.test(password) }));
}

/** Each validator returns an error message, or undefined when the value is valid. */

export function validateFullName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return 'Enter your full name.';
  if (name.length < NAME_MIN_LENGTH) return `Full name must be at least ${NAME_MIN_LENGTH} characters.`;
  if (name.length > NAME_MAX_LENGTH) return `Full name must be ${NAME_MAX_LENGTH} characters or fewer.`;
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    return 'Enter a valid email address.';
  }
  return undefined;
}

/** Login only checks presence. Complexity rules apply when creating a password. */
export function validateLoginPassword(value: string): string | undefined {
  if (!value) return 'Enter your password.';
  return undefined;
}

export function validateNewPassword(value: string): string | undefined {
  if (!value) return 'Create a password.';
  // Count bytes, not characters, to match the server. Accented letters and
  // symbols take more than one byte.
  if (new TextEncoder().encode(value).length > PASSWORD_MAX_BYTES) {
    return `Password is too long (maximum ${PASSWORD_MAX_BYTES} bytes).`;
  }
  if (!PASSWORD_RULES.every((rule) => rule.test(value))) {
    return 'Password does not meet all the requirements.';
  }
  return undefined;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (!confirmPassword) return 'Confirm your password.';
  if (confirmPassword !== password) return 'Passwords do not match.';
  return undefined;
}

function compact<T extends Record<string, string | undefined>>(errors: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(errors) as (keyof T)[]) {
    if (errors[key]) result[key] = errors[key];
  }
  return result;
}

export function validateLogin(data: LoginFormData): LoginFieldErrors {
  return compact({
    email: validateEmail(data.email),
    password: validateLoginPassword(data.password),
  });
}

export function validateRegister(data: RegisterFormData): RegisterFieldErrors {
  return compact({
    fullName: validateFullName(data.fullName),
    email: validateEmail(data.email),
    password: validateNewPassword(data.password),
    confirmPassword: validateConfirmPassword(data.password, data.confirmPassword),
  });
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}
