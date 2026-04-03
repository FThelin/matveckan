jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ kind: 'supabase-client' })),
}));

import { createClient } from '@supabase/supabase-js';

import {
  buildSupabaseConfig,
  createSupabaseClient,
  getSupabaseStatusLabel,
} from './client';

describe('supabase client foundation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds a configured Supabase config from Expo public env vars', () => {
    const config = buildSupabaseConfig({
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    });

    expect(config).toEqual({
      anonKey: 'anon-key',
      isConfigured: true,
      url: 'https://example.supabase.co',
    });
  });

  it('reports missing config when required env vars are absent', () => {
    const config = buildSupabaseConfig({});

    expect(config.isConfigured).toBe(false);
    expect(getSupabaseStatusLabel(config)).toBe('Supabase ej konfigurerat');
  });

  it('creates a Supabase client only when configuration is complete', () => {
    const config = buildSupabaseConfig({
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    });

    const client = createSupabaseClient(config);

    expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key');
    expect(client).toEqual({ kind: 'supabase-client' });
  });

  it('returns null instead of creating a client when configuration is missing', () => {
    const client = createSupabaseClient(buildSupabaseConfig({}));

    expect(client).toBeNull();
    expect(createClient).toHaveBeenCalledTimes(0);
  });
});
