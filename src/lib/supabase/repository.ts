import type { SupabaseClient } from '@supabase/supabase-js';

import type { Recipe, UserProfile } from '../../domain/types';
import { fromProfileRow, fromRecipeRow, type ProfileRow, type RecipeRow } from './records';

export const loadCatalogRecipes = async (
  client: SupabaseClient,
): Promise<Recipe[]> => {
  const { data, error } = await client.from('recipe_catalog').select('*').order('name');

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as RecipeRow[]).map(fromRecipeRow);
};

export const loadProfileById = async (
  client: SupabaseClient,
  profileId: string,
): Promise<UserProfile | null> => {
  const { data, error } = await client
    .from('profiles')
    .select('id, email, display_name, pantry_items')
    .eq('id', profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return fromProfileRow(data as ProfileRow);
};
