import { requestMagicLink, resolveCurrentAuthUser, subscribeToAuthChanges } from './auth';

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
