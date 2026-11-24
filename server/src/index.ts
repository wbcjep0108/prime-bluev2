import type { Server } from 'node:http';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { createApp } from './app.js';

async function main() {
  if (env.mongodbUri) {
    try {
      await connectDatabase(env.mongodbUri);
      console.log('[db] connected to MongoDB');
    } catch (err) {
      // Never print the URI: it contains credentials.
      console.error(
        `[db] failed to connect: ${err instanceof Error ? err.message : String(err)}`,
      );
      process.exit(1);
    }
  } else {
    console.warn(
      '[db] MONGODB_URI is not set. Starting without a database; /api/v1/health will report "degraded".',
    );
  }

  const app = createApp();
  const server: Server = app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`);
    console.log(`[server] CORS origin: ${env.clientUrl}`);
  });

  const shutdown = (signal: string) => {
    console.log(`[server] ${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
