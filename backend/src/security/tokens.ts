/**
 * Session Token Management
 */

import crypto from 'node:crypto';
import type { SessionData } from '../types.js';

export const activeTokens = new Map<string, SessionData>();
export const preAuthTokens = new Map<string, { studentId: string; expiresAt: number }>();

export function generateToken(
  role: SessionData['role'],
  entityId: string,
  metadata?: Record<string, any>,
  ttlSeconds = 86400
): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.set(token, {
    role,
    entityId,
    metadata,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  return token;
}

export function verifyToken(token: string): SessionData | null {
  const session = activeTokens.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeTokens.delete(token);
    return null;
  }
  return session;
}

export function clearAllTokens(): void {
  activeTokens.clear();
  preAuthTokens.clear();
}
