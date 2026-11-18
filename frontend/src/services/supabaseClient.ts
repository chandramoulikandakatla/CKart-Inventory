import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials safely from Vite import.meta.env or process.env
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }).env : undefined;

const supabaseUrl =
  metaEnv?.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  '';

const supabaseAnonKey =
  metaEnv?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

/**
 * Singleton Supabase Client instance.
 * Automatically falls back to a dummy placeholder if credentials are not configured yet,
 * preventing initialization crashes in offline / demo mode.
 */
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://placeholder-domain.supabase.co', 'placeholder-anon-key', {
      auth: { persistSession: false },
    });
