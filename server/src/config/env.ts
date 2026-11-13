import 'dotenv/config';

export interface Env {
  nodeEnv: string;
  port: number;
  clientUrl: string;
  /** Empty string when MONGODB_URI is not configured. */
  mongodbUri: string;
}

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

  return { nodeEnv, port, clientUrl, mongodbUri };
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
