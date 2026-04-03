import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type EnvSource = Record<string, string | undefined>;

export type SupabaseConfig = {
  url: string;
  anonKey: string;
  isConfigured: boolean;
};

export const buildSupabaseConfig = (env: EnvSource = process.env): SupabaseConfig => {
  const url = env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
};

export const createSupabaseClient = (
  config: SupabaseConfig,
): SupabaseClient | null => {
  if (!config.isConfigured) {
    return null;
  }

  return createClient(config.url, config.anonKey);
};

export const getSupabaseStatusLabel = (config: SupabaseConfig) =>
  config.isConfigured ? 'Supabase konfigurerat' : 'Supabase ej konfigurerat';
