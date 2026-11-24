const DEFAULT_API_URL = 'http://localhost:4000/api/v1';

// NEXT_PUBLIC_ variables are inlined at build time, so with output: 'export'
// the value is fixed for each build. The literal property access below is
// required for that inlining to work.
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;

/** Base URL of the backend API, without a trailing slash. */
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

// The Google OAuth client ID is public by design (it appears in the page that
// loads Google sign-in). It is not the client secret. When it is missing, the
// Google button is hidden instead of rendering broken.
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';
