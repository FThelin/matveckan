import type { SupabaseClient } from '@supabase/supabase-js';

import type { Recipe } from '../../domain/types';
import { fromRecipeRow, toRecipeRow, type RecipeRow } from './records';

export const createRecipeRecord = async (
  client: SupabaseClient,
  recipe: Recipe,
): Promise<Recipe> => {
  const { data, error } = await client.from('recipes').insert(toRecipeRow(recipe)).select('*');

  if (error) {
    throw new Error(error.message);
  }

  const row = (data as RecipeRow[] | null)?.[0];
  if (!row) {
    throw new Error('Supabase returnerade ingen receptpost');
  }

  return fromRecipeRow(row);
};

export const loadOwnedRecipes = async (
  client: SupabaseClient,
  ownerId: string,
): Promise<Recipe[]> => {
  const { data, error } = await client
    .from('recipes')
    .select('*')
    .eq('owner_id', ownerId)
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as RecipeRow[]).map(fromRecipeRow);
};
