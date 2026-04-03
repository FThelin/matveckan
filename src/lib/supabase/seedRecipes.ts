import { seedRecipes } from '../../domain/seedData';
import type { RecipeInsert } from './records';
import { toRecipeRow } from './records';

export const buildSeedRecipeRows = (): RecipeInsert[] =>
  seedRecipes.map((recipe) => toRecipeRow(recipe));
