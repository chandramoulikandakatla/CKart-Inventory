/**
 * Cryptographic hashing and verification using PBKDF2
 */

import crypto from 'node:crypto';

export function hashSecret(secret: string, saltHex?: string): string {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
  const derived = crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

export function verifySecret(secret: string, combined: string): boolean {
  try {
    const [saltHex, hashHex] = combined.split(':');
    if (!saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
