import type { Session, SupabaseClient } from '@supabase/supabase-js';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export const requestMagicLink = async (
  client: SupabaseClient,
  email: string,
) => {
  const { error } = await client.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const resolveCurrentAuthUser = (session: Session | null): AuthUser | null => {
  const user = session?.user;
  if (!user?.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name:
      typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim()
        ? user.user_metadata.name.trim()
        : user.email.split('@')[0] ?? 'Anvandare',
  };
};
