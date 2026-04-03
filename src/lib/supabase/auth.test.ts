import { requestMagicLink, resolveCurrentAuthUser } from './auth';

describe('supabase auth adapter', () => {
  it('requests a magic link from Supabase auth', async () => {
    const signInWithOtp = jest.fn().mockResolvedValue({ error: null });
    const client = {
      auth: {
        signInWithOtp,
      },
    };

    await requestMagicLink(client as never, 'fredrik@example.com');

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'fredrik@example.com',
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

    await expect(requestMagicLink(client as never, 'fredrik@example.com')).rejects.toThrow(
      'Rate limit reached',
    );
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
