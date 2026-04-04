import {
  createSessionFromUrl,
  requestMagicLink,
  resolveCurrentAuthUser,
  subscribeToAuthChanges,
} from './auth';

describe('supabase auth adapter', () => {
  it('requests a magic link from Supabase auth', async () => {
    const signInWithOtp = jest.fn().mockResolvedValue({ error: null });
    const client = {
      auth: {
        signInWithOtp,
      },
    };

    await requestMagicLink(client as never, 'fredrik@example.com', 'matveckan://auth');

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'fredrik@example.com',
      options: {
        emailRedirectTo: 'matveckan://auth',
      },
    });
  });

  it('throws the Supabase auth error message when the request fails', async () => {
    const signInWithOtp = jest.fn().mockResolvedValue({
      error: { message: 'Rate limit reached' },
    });
    const client = {
      auth: {
        signInWithOtp,
      },
    };

    await expect(
      requestMagicLink(client as never, 'fredrik@example.com', 'matveckan://auth'),
    ).rejects.toThrow(
      'Rate limit reached',
    );
  });

  it('subscribes to Supabase auth state changes', () => {
    const listener = jest.fn();
    const subscription = { unsubscribe: jest.fn() };
    const onAuthStateChange = jest.fn(() => ({
      data: { subscription },
    }));
    const client = {
      auth: {
        onAuthStateChange,
      },
    };

    const result = subscribeToAuthChanges(client as never, listener);

    expect(onAuthStateChange).toHaveBeenCalled();
    expect(result).toBe(subscription);
  });

  it('creates a session from a deep link URL that contains auth tokens', async () => {
    const setSession = jest.fn().mockResolvedValue({
      data: {
        session: {
          access_token: 'token-1',
          refresh_token: 'refresh-1',
          user: { id: 'user-1', email: 'fredrik@example.com' },
        },
      },
      error: null,
    });
    const client = {
      auth: {
        setSession,
      },
    };

    await createSessionFromUrl(
      client as never,
      'matveckan://auth#access_token=token-1&refresh_token=refresh-1&type=magiclink',
    );

    expect(setSession).toHaveBeenCalledWith({
      access_token: 'token-1',
      refresh_token: 'refresh-1',
    });
  });

  it('ignores incoming URLs without auth tokens', async () => {
    const setSession = jest.fn();
    const client = {
      auth: {
        setSession,
      },
    };

    const session = await createSessionFromUrl(client as never, 'matveckan://auth');

    expect(session).toBeNull();
    expect(setSession).not.toHaveBeenCalled();
  });

  it('maps the current auth user from a Supabase session', () => {
    const user = resolveCurrentAuthUser({
      user: {
        id: 'user-1',
        email: 'fredrik@example.com',
        user_metadata: { name: 'Fredrik' },
      },
    } as never);

    expect(user).toEqual({
      email: 'fredrik@example.com',
      id: 'user-1',
      name: 'Fredrik',
    });
  });

  it('returns null when there is no signed in user', () => {
    expect(resolveCurrentAuthUser(null)).toBeNull();
  });
});
