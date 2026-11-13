import mongoose from 'mongoose';

export type DatabaseState =
  | 'disconnected'
  | 'connected'
  | 'connecting'
  | 'disconnecting'
  | 'unknown';

const READY_STATES: Record<number, DatabaseState> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

mongoose.set('strictQuery', true);

/**
 * Opens the shared Mongoose connection. Safe to call more than once.
 * Throws if the connection cannot be established.
 */
export async function connectDatabase(uri: string): Promise<void> {
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  if (mongoose.connection.readyState === 1) {
    return;
  }

  mongoose.connection.on('error', (err: Error) => {
    console.error(`[db] connection error: ${err.message}`);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

/** Current connection state, straight from Mongoose. */
export function getDatabaseState(): DatabaseState {
  return READY_STATES[mongoose.connection.readyState] ?? 'unknown';
}

/**
 * Verifies the database actually responds, not just that a socket exists.
 */
export async function pingDatabase(): Promise<boolean> {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return false;
  }
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch {
    return false;
  }
}
