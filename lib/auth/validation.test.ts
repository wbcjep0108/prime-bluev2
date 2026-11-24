import { describe, expect, it } from 'vitest';
import {
  getPasswordRuleStatus,
  hasErrors,
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validateLogin,
  validateLoginPassword,
  validateNewPassword,
  validateRegister,
} from './validation';

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('')).toBe('Enter your email address.');
    expect(validateEmail('   ')).toBe('Enter your email address.');
  });

  it('rejects malformed addresses', () => {
    for (const bad of ['plain', 'a@b', '@b.com', 'a@.com', 'a b@c.com', 'a@b@c.com']) {
      expect(validateEmail(bad), bad).toBe('Enter a valid email address.');
    }
  });

  it('rejects addresses over 254 characters', () => {
    expect(validateEmail(`${'a'.repeat(250)}@b.com`)).toBe('Enter a valid email address.');
  });

  it('accepts valid addresses and ignores surrounding spaces', () => {
    expect(validateEmail('user@example.com')).toBeUndefined();
    expect(validateEmail('  first.last+tag@sub.example.co  ')).toBeUndefined();
  });
});

describe('validateFullName', () => {
  it('requires a value', () => {
    expect(validateFullName('  ')).toBe('Enter your full name.');
  });

  it('enforces length limits on the trimmed value', () => {
    expect(validateFullName('A')).toMatch(/at least 2/);
    expect(validateFullName('A'.repeat(61))).toMatch(/60 characters or fewer/);
    expect(validateFullName('Al')).toBeUndefined();
    expect(validateFullName('A'.repeat(60))).toBeUndefined();
  });
});

describe('validateLoginPassword', () => {
  it('only requires presence, with no complexity rules', () => {
    expect(validateLoginPassword('')).toBe('Enter your password.');
    expect(validateLoginPassword('a')).toBeUndefined();
  });
});

describe('validateNewPassword and rules', () => {
  it('requires a value', () => {
    expect(validateNewPassword('')).toBe('Create a password.');
  });

  it('rejects passwords missing any rule', () => {
    const failing = ['Short1a', 'alllowercase1', 'ALLUPPERCASE1', 'NoNumbersHere'];
    for (const pw of failing) {
      expect(validateNewPassword(pw), pw).toBe('Password does not meet all the requirements.');
    }
  });

  it('rejects passwords over 72 bytes and accepts exactly 72', () => {
    expect(validateNewPassword(`Aa1${'x'.repeat(70)}`)).toMatch(/maximum 72 bytes/);
    expect(validateNewPassword(`Aa1${'x'.repeat(69)}`)).toBeUndefined();
  });

  it('counts bytes, so multi-byte characters reach the limit sooner', () => {
    // 3 + 35 two-byte characters = 73 bytes with only 38 characters.
    expect(validateNewPassword(`Aa1${'\u00e9'.repeat(35)}`)).toMatch(/maximum 72 bytes/);
  });

  it('accepts a password that meets every rule', () => {
    expect(validateNewPassword('Abcdefg1')).toBeUndefined();
  });

  it('reports each rule status', () => {
    const status = (pw: string) =>
      Object.fromEntries(getPasswordRuleStatus(pw).map(({ rule, met }) => [rule.id, met]));

    expect(status('')).toEqual({ length: false, uppercase: false, lowercase: false, number: false });
    expect(status('abc')).toEqual({ length: false, uppercase: false, lowercase: true, number: false });
    expect(status('Abcdefg1')).toEqual({ length: true, uppercase: true, lowercase: true, number: true });
  });
});

describe('validateConfirmPassword', () => {
  it('requires a value', () => {
    expect(validateConfirmPassword('Abcdefg1', '')).toBe('Confirm your password.');
  });

  it('requires an exact match', () => {
    expect(validateConfirmPassword('Abcdefg1', 'abcdefg1')).toBe('Passwords do not match.');
    expect(validateConfirmPassword('Abcdefg1', 'Abcdefg1')).toBeUndefined();
  });
});

describe('form-level validation', () => {
  it('validateLogin returns only the failing fields', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Enter your email address.',
      password: 'Enter your password.',
    });
    expect(validateLogin({ email: 'a@b.co', password: 'x' })).toEqual({});
  });

  it('validateRegister returns only the failing fields', () => {
    const errors = validateRegister({
      fullName: 'Jo Doe',
      email: 'jo@example.com',
      password: 'Abcdefg1',
      confirmPassword: 'different',
    });
    expect(errors).toEqual({ confirmPassword: 'Passwords do not match.' });

    expect(
      validateRegister({
        fullName: 'Jo Doe',
        email: 'jo@example.com',
        password: 'Abcdefg1',
        confirmPassword: 'Abcdefg1',
      }),
    ).toEqual({});
  });

  it('hasErrors reflects whether any error exists', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ email: 'x' })).toBe(true);
  });
});
