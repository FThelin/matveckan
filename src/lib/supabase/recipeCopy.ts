import type { SupabaseClient } from '@supabase/supabase-js';

import type { Recipe } from '../../domain/types';
import { fromRecipeRow, toRecipeRow, type RecipeRow } from './records';

const uniqueId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const copyRecipeRecord = async (
  client: SupabaseClient,
  sourceRecipe: Recipe,
  ownerId: string,
): Promise<Recipe> => {
  const copiedRecipe: Recipe = {
    ...sourceRecipe,
    id: uniqueId('recipe'),
    ownerId,
    source: 'copied',
    sourceRecipeId: sourceRecipe.id,
    isPublic: false,
    ratingEntries: [],
    comments: [],
    averageRating: undefined,
    commentCount: undefined,
  };

  const { data, error } = await client.from('recipes').insert(toRecipeRow(copiedRecipe)).select('*');

  if (error) {
    throw new Error(error.message);
  }

  const row = (data as RecipeRow[] | null)?.[0];
  if (!row) {
    throw new Error('Supabase returnerade ingen kopierad receptpost');
  }

  return fromRecipeRow(row);
};
