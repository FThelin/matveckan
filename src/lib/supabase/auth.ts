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

const getTokensFromUrl = (url: string) => {
  const decoded = decodeURIComponent(url);
  const fragment = decoded.includes('#') ? decoded.split('#')[1] ?? '' : '';
  const query = fragment || (decoded.includes('?') ? decoded.split('?')[1] ?? '' : '');
  const params = new URLSearchParams(query);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
  };
};

export const createSessionFromUrl = async (
  client: SupabaseClient,
  url: string,
) => {
  const tokens = getTokensFromUrl(url);
  if (!tokens) {
    return null;
  }

  const { data, error } = await client.auth.setSession(tokens);
  if (error) {
    throw new Error(error.message);
  }

  return data.session;
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
