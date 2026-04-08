import type { SupabaseClient } from '@supabase/supabase-js';

import { ensureProfileForSessionUser, loadSessionUser } from './profileSync';

describe('supabase profile sync', () => {
  it('loads the current auth user from Supabase session', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-1',
            email: 'fredrik@example.com',
            user_metadata: { name: 'Fredrik' },
          },
        },
      },
      error: null,
    });
    const client = {
      auth: { getSession },
    } as unknown as SupabaseClient;

    const user = await loadSessionUser(client);

    expect(user).toEqual({
      id: 'user-1',
      email: 'fredrik@example.com',
      name: 'Fredrik',
    });
  });

  it('creates a profile row when the session user has no profile yet', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const eq = jest.fn(() => ({ maybeSingle }));
    const select = jest.fn(() => ({ eq }));
    const upsert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn((table: string) =>
      table === 'profiles' ? { select: jest.fn(() => ({ eq })), upsert } : { select },
    );
    const client = { from } as unknown as SupabaseClient;

    await ensureProfileForSessionUser(client, {
      id: 'user-1',
      email: 'fredrik@example.com',
      name: 'Fredrik',
    });

    expect(upsert).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'fredrik@example.com',
      display_name: 'Fredrik',
      pantry_items: ['salt', 'peppar', 'olivolja'],
    });
  });
});
