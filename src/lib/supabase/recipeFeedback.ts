import type { SupabaseClient } from '@supabase/supabase-js';

import type { RecipeComment, RecipeRating } from '../../domain/types';

type RecipeCommentRow = {
  id: string;
  recipe_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles?: {
    display_name?: string | null;
  } | null;
};

export const upsertRecipeRatingRecord = async (
  client: SupabaseClient,
  rating: RecipeRating,
) => {
  const { error } = await client.from('recipe_ratings').upsert({
    recipe_id: rating.recipeId,
    user_id: rating.userId,
    value: rating.value,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const addRecipeCommentRecord = async (
  client: SupabaseClient,
  input: {
    recipeId: string;
    userId: string;
    authorName: string;
    text: string;
  },
): Promise<RecipeComment> => {
  const { data, error } = await client
    .from('recipe_comments')
    .insert({
      recipe_id: input.recipeId,
      user_id: input.userId,
      body: input.text,
    })
    .select('id, recipe_id, user_id, body, created_at, profiles(display_name)');

  if (error) {
    throw new Error(error.message);
  }

  const row = (data as RecipeCommentRow[] | null)?.[0];
  if (!row) {
    throw new Error('Supabase returnerade ingen kommentar');
  }

  return {
    id: row.id,
    recipeId: row.recipe_id,
    authorId: row.user_id,
    authorName: row.profiles?.display_name || input.authorName,
    text: row.body,
    createdAt: row.created_at,
  };
};
