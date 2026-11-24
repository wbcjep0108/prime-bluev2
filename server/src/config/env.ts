import 'dotenv/config';

export interface Env {
  nodeEnv: string;
  port: number;
  clientUrl: string;
  /** Empty string when MONGODB_URI is not configured. */
  mongodbUri: string;
  /** Secret used to sign session JWTs. Required. */
  jwtSecret: string;
  /** Google OAuth client ID. ID tokens must have this as their audience. Required. */
  googleClientId: string;
}

const JWT_SECRET_MIN_LENGTH = 32;

function fail(message: string): never {
  throw new Error(`[env] ${message}`);
}

function loadEnv(): Env {
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  const rawPort = process.env.PORT?.trim() || '4000';
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    fail(`PORT must be an integer between 1 and 65535 (received "${rawPort}")`);
  }

  const rawClientUrl = process.env.CLIENT_URL?.trim() || 'http://localhost:3000';
  let clientUrl: string;
  try {
    // Normalise to a bare origin, which is what the CORS check compares against.
    clientUrl = new URL(rawClientUrl).origin;
  } catch {
    fail(`CLIENT_URL must be a valid URL (received "${rawClientUrl}")`);
  }

  const mongodbUri = process.env.MONGODB_URI?.trim() ?? '';
  if (mongodbUri && !/^mongodb(\+srv)?:\/\//.test(mongodbUri)) {
    fail('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }
  if (!mongodbUri && nodeEnv === 'production') {
    fail('MONGODB_URI is required when NODE_ENV=production');
  }

  const jwtSecret = process.env.JWT_SECRET?.trim() ?? '';
  if (!jwtSecret) {
    fail(
      'JWT_SECRET is required. Add JWT_SECRET to server/.env (a random string of at least ' +
        `${JWT_SECRET_MIN_LENGTH} characters).`,
    );
  }
  if (jwtSecret.length < JWT_SECRET_MIN_LENGTH) {
    fail(`JWT_SECRET must be at least ${JWT_SECRET_MIN_LENGTH} characters long`);
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? '';
  if (!googleClientId) {
    fail(
      'GOOGLE_CLIENT_ID is required. Add GOOGLE_CLIENT_ID to server/.env ' +
        '(the OAuth client ID from the Google Cloud console, not the client secret).',
    );
  }

  return { nodeEnv, port, clientUrl, mongodbUri, jwtSecret, googleClientId };
}

function loadEnvOrExit(): Env {
  try {
    return loadEnv();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

export const env: Env = loadEnvOrExit();
