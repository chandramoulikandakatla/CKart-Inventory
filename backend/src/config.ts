/**
 * CampusKart Server Configuration
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser to avoid heavy external dependencies
function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [k, ...rest] = trimmed.split('=');
    const key = k.trim();
    const val = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (key && !process.env[key]) {
      process.env[key] = val;
    }
  }
}

// Load .env from project root or backend
loadEnv(path.resolve(__dirname, '../../.env'));
loadEnv(path.resolve(__dirname, '../.env'));

export const PORT = parseInt(process.env.PORT || '8080', 10);
export const HOST = process.env.HOST || '127.0.0.1';
export const SESSION_SECRET = process.env.CAMPUSKART_SESSION_SECRET || 'campuskart-ts-secure-secret-key-2026';
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
export const DATA_FILE = process.env.CAMPUSKART_DB_FILE || path.resolve(__dirname, '../campuskart_data.json');
