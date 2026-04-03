import type { Recipe, RecipeIngredient, RecipeSource, RecipeStep, UserProfile } from '../../domain/types';

export type ProfileRow = {
  id: string;
  email: string;
  display_name: string;
  pantry_items: string[];
};

export type ProfileInsert = {
  id: string;
  display_name: string;
  pantry_items: string[];
};

export type RecipeRow = {
  id: string;
  owner_id: string | null;
  source: RecipeSource;
  source_recipe_id: string | null;
  name: string;
  image_uri: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  is_public: boolean;
  average_rating?: number | null;
  comment_count?: number | null;
};

export type RecipeInsert = {
  id: string;
  owner_id: string | null;
  source: RecipeSource;
  source_recipe_id: string | null;
  name: string;
  image_uri: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  is_public: boolean;
};

export const toProfileRow = (profile: UserProfile): ProfileInsert => ({
  id: profile.id,
  display_name: profile.name,
  pantry_items: profile.pantryItems,
});

export const fromProfileRow = (row: ProfileRow): UserProfile => ({
  id: row.id,
  name: row.display_name,
  email: row.email,
  pantryItems: row.pantry_items,
});

export const toRecipeRow = (recipe: Recipe): RecipeInsert => ({
  id: recipe.id,
  owner_id: recipe.ownerId,
  source: recipe.source,
  source_recipe_id: recipe.sourceRecipeId ?? null,
  name: recipe.name,
  image_uri: recipe.imageUri,
  tags: recipe.tags,
  ingredients: recipe.ingredients,
  steps: recipe.steps,
  is_public: recipe.isPublic,
});

export const fromRecipeRow = (row: RecipeRow): Recipe => ({
  id: row.id,
  ownerId: row.owner_id,
  source: row.source,
  sourceRecipeId: row.source_recipe_id ?? undefined,
  name: row.name,
  imageUri: row.image_uri,
  tags: row.tags,
  ingredients: row.ingredients,
  steps: row.steps,
  isPublic: row.is_public,
  ratingEntries: [],
  comments: [],
  averageRating: row.average_rating ?? undefined,
  commentCount: row.comment_count ?? undefined,
});
