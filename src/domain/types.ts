export type DayOfWeek =
  | 'Mondag'
  | 'Tisdag'
  | 'Onsdag'
  | 'Torsdag'
  | 'Fredag'
  | 'Lordag'
  | 'Sondag';

export type RecipeSource = 'seed' | 'user' | 'copied';

export type RecipeIngredient = {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
};

export type RecipeStep = {
  id: string;
  text: string;
};

export type RecipeComment = {
  id: string;
  recipeId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type RecipeRating = {
  recipeId: string;
  userId: string;
  value: 1 | 2 | 3 | 4 | 5;
};

export type Recipe = {
  id: string;
  ownerId: string | null;
  source: RecipeSource;
  sourceRecipeId?: string;
  name: string;
  imageUri: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  isPublic: boolean;
  ratingEntries: RecipeRating[];
  comments: RecipeComment[];
  averageRating?: number;
  commentCount?: number;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  pantryItems: string[];
};

export type WeeklyTemplateDay = {
  day: DayOfWeek;
  tag: string;
};

export type WeeklyTemplate = {
  id: string;
  ownerId: string;
  days: WeeklyTemplateDay[];
};

export type WeeklyPlanDay = WeeklyTemplateDay & {
  recipeId?: string;
};

export type WeeklyPlan = {
  id: string;
  ownerId: string;
  days: WeeklyPlanDay[];
};

export type RecipeSearchSections = {
  builtIn: Recipe[];
  community: Recipe[];
};

export type ShoppingListItem = {
  name: string;
  recipeNames: string[];
};
