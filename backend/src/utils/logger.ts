/**
 * Structured Logging & Application Performance Monitoring (APM)
 * Production-grade Pino JSON logger with request tracing and latency metrics.
 */

import pino from 'pino';
import crypto from 'node:crypto';
import http from 'node:http';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export interface RequestLogMeta {
  requestId: string;
  method: string;
  pathname: string;
  statusCode?: number;
  latencyMs?: number;
  role?: string;
  userId?: string;
  error?: string;
}

export function generateRequestId(): string {
  return `req_${crypto.randomBytes(6).toString('hex')}`;
}

export function logRequestStart(req: http.IncomingMessage & { _requestId?: string; _startTime?: bigint }) {
  req._requestId = generateRequestId();
  req._startTime = process.hrtime.bigint();
}

export function logRequestComplete(
  req: http.IncomingMessage & { _requestId?: string; _startTime?: bigint },
  res: http.ServerResponse,
  extra?: { role?: string; userId?: string; cached?: boolean; error?: string }
) {
  const latencyMs = req._startTime
    ? Number(process.hrtime.bigint() - req._startTime) / 1e6
    : 0;

  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  const logPayload: RequestLogMeta = {
    requestId: req._requestId || 'unknown',
    method: req.method || 'GET',
    pathname: parsedUrl.pathname,
    statusCode: res.statusCode,
    latencyMs: Number(latencyMs.toFixed(2)),
    ...(extra?.role ? { role: extra.role } : {}),
    ...(extra?.userId ? { userId: extra.userId } : {}),
    ...(extra?.error ? { error: extra.error } : {}),
  };

  if (res.statusCode >= 500) {
    logger.error(logPayload, `API ${req.method} ${parsedUrl.pathname} 5xx Server Error`);
  } else if (res.statusCode >= 400) {
    logger.warn(logPayload, `API ${req.method} ${parsedUrl.pathname} 4xx Client Warning`);
  } else {
    logger.info(logPayload, `API ${req.method} ${parsedUrl.pathname} 2xx Success`);
  }
}
