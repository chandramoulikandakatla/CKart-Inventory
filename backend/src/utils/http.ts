/**
 * HTTP Utilities for Request Handling & Responses
 */

import http from 'node:http';

export function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

export function getCorsOrigin(origin?: string): string {
  if (!origin) return '*';
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return origin;
  }
  return '*';
}

export function sendJson(
  res: http.ServerResponse,
  statusCode: number,
  data: any,
  options?: { reqOrigin?: string; cached?: boolean; customHeaders?: Record<string, string> }
) {
  const req = (res as any).req;
  const incomingOrigin = options?.reqOrigin || req?.headers?.origin;

  let responseTimeMs: string | undefined;
  if (req?._startTime) {
    const diff = Number(process.hrtime.bigint() - req._startTime) / 1e6;
    responseTimeMs = `${diff.toFixed(2)}ms`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': getCorsOrigin(incomingOrigin),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Idempotency-Key',
    ...(req?._requestId ? { 'X-Request-Id': req._requestId } : {}),
    ...(responseTimeMs ? { 'X-Response-Time': responseTimeMs } : {}),
    ...(options?.cached !== undefined ? { 'X-Cache': options.cached ? 'HIT' : 'MISS' } : {}),
    ...(options?.customHeaders || {}),
  };

  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(data));
}

export function getAuthHeader(req: http.IncomingMessage): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

export function getCookie(req: http.IncomingMessage, name: string): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function createSessionCookie(token: string, maxAgeSeconds = 86400): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `session_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function getAuthToken(req: http.IncomingMessage): string | null {
  return getAuthHeader(req) || getCookie(req, 'session_token');
}
