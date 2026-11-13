import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { getDatabaseState, pingDatabase } from '../config/database.js';

export const getHealth: RequestHandler = async (_req, res) => {
  const configured = env.mongodbUri !== '';
  const state = getDatabaseState();
  const reachable = configured && (await pingDatabase());

  // "ok" only when the database answered a ping; otherwise report degraded.
  const healthy = reachable;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      configured,
      state,
      reachable,
    },
  });
};
