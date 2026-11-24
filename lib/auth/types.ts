export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type LoginFieldErrors = Partial<Record<keyof LoginFormData, string>>;
export type RegisterFieldErrors = Partial<Record<keyof RegisterFormData, string>>;

/** Which flow a Google credential is used for. The server treats them differently. */
export type GoogleAuthMode = 'login' | 'register';

/** The only user shape the server returns. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

/** Machine-readable reason for a failed auth call, derived from the HTTP status. */
export type AuthErrorCode =
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'NETWORK'
  | 'SERVER'
  | 'UNKNOWN';

export interface AuthFailure {
  ok: false;
  code: AuthErrorCode;
  message: string;
}

export type AuthResult =
  | { ok: true; user?: AuthUser; message?: string }
  | AuthFailure;

/** Result of asking the server who is logged in. A success always has a user. */
export type SessionResult = { ok: true; user: AuthUser } | AuthFailure;

/** Signature the forms receive as a prop, so the UI never calls the API directly. */
export type LoginSubmitHandler = (data: LoginFormData) => Promise<AuthResult>;
export type RegisterSubmitHandler = (data: RegisterFormData) => Promise<AuthResult>;
export type GoogleCredentialHandler = (credential: string) => Promise<AuthResult>;
