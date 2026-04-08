import type { SupabaseClient } from '@supabase/supabase-js';

import { createProfile } from '../../domain/recipes';
import type { UserProfile } from '../../domain/types';
import { resolveCurrentAuthUser, type AuthUser } from './auth';
import { fromProfileRow, toProfileRow, type ProfileRow } from './records';

export const loadSessionUser = async (
  client: SupabaseClient,
): Promise<AuthUser | null> => {
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return resolveCurrentAuthUser(data.session);
};

export const ensureProfileForSessionUser = async (
  client: SupabaseClient,
  authUser: AuthUser,
): Promise<UserProfile> => {
  const { data, error } = await client
    .from('profiles')
    .select('id, email, display_name, pantry_items')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return fromProfileRow(data as ProfileRow);
  }

  const fallbackProfile = createProfile(authUser.name, authUser.email);
  const profile: UserProfile = {
    ...fallbackProfile,
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
  };

  const { error: upsertError } = await client.from('profiles').upsert(toProfileRow(profile));

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  return profile;
};
