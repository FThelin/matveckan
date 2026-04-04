import type { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export const buildAuthRedirectUrl = () => {
  try {
    return Linking.createURL('auth', { scheme: 'matveckan' });
  } catch {
    return 'matveckan://auth';
  }
};

export const requestMagicLink = async (
  client: SupabaseClient,
  email: string,
  emailRedirectTo?: string,
) => {
  const { error } = await client.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: emailRedirectTo
      ? {
          emailRedirectTo,
        }
      : undefined,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const subscribeToAuthChanges = (
  client: SupabaseClient,
  listener: (event: AuthChangeEvent, session: Session | null) => void,
) => client.auth.onAuthStateChange(listener).data.subscription;

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
