import { DAYS } from './constants';
import type {
  DayOfWeek,
  Recipe,
  RecipeComment,
  RecipeRating,
  RecipeSearchSections,
  ShoppingListItem,
  UserProfile,
  WeeklyPlan,
  WeeklyPlanDay,
  WeeklyTemplate,
} from './types';

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const uniqueId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const averageRating = (recipe: Recipe) => {
  if (recipe.ratingEntries.length === 0) {
    return 0;
  }

  const total = recipe.ratingEntries.reduce((sum, entry) => sum + entry.value, 0);
  return Number((total / recipe.ratingEntries.length).toFixed(1));
};

export const createProfile = (name: string, email: string): UserProfile => ({
  id: uniqueId('user'),
  name: name.trim(),
  email: email.trim().toLowerCase(),
  pantryItems: ['salt', 'peppar', 'olivolja'],
});

export const createRecipe = (input: {
  ownerId: string;
  name: string;
  imageUri?: string;
  tags: string[];
  ingredients: string[];
  steps: string[];
  isPublic: boolean;
}): Recipe => ({
  id: uniqueId('recipe'),
  ownerId: input.ownerId,
  source: 'user',
  name: input.name.trim(),
  imageUri:
    input.imageUri?.trim() ||
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
  tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
  ingredients: input.ingredients
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name, index) => ({
      id: `ingredient-${index}-${slugify(name)}`,
      name,
    })),
  steps: input.steps
    .map((step) => step.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `step-${index + 1}`,
      text,
    })),
  isPublic: input.isPublic,
  ratingEntries: [],
  comments: [],
});

export const buildDiscoverSections = (
  recipes: Recipe[],
  currentUserId: string,
): RecipeSearchSections => ({
  builtIn: recipes.filter((recipe) => recipe.source === 'seed'),
  community: recipes.filter(
    (recipe) => recipe.isPublic && recipe.ownerId !== currentUserId && recipe.source !== 'seed',
  ),
});

export const copyRecipeToLibrary = (
  recipes: Recipe[],
  recipeId: string,
  ownerId: string,
): Recipe[] => {
  const recipe = recipes.find((item) => item.id === recipeId);
  if (!recipe) {
    return recipes;
  }

  const copy: Recipe = {
    ...recipe,
    id: uniqueId('recipe'),
    ownerId,
    source: 'copied',
    sourceRecipeId: recipe.id,
    isPublic: false,
    ratingEntries: [],
    comments: [],
  };

  return [copy, ...recipes];
};

export const upsertRecipeRating = (
  recipe: Recipe,
  rating: RecipeRating,
): Recipe => {
  const others = recipe.ratingEntries.filter((entry) => entry.userId !== rating.userId);
  return {
    ...recipe,
    ratingEntries: [...others, rating],
  };
};

export const addRecipeComment = (
  recipe: Recipe,
  comment: Omit<RecipeComment, 'id' | 'createdAt'>,
): Recipe => ({
  ...recipe,
  comments: [
    {
      ...comment,
      id: uniqueId('comment'),
      createdAt: new Date().toISOString(),
    },
    ...recipe.comments,
  ],
});

const chooseRecipeId = (
  recipes: Recipe[],
  usedRecipeIds: Set<string>,
  random: () => number,
) => {
  const available = recipes.filter((recipe) => !usedRecipeIds.has(recipe.id));
  const pool = available.length > 0 ? available : recipes;
  if (pool.length === 0) {
    return undefined;
  }

  const index = Math.floor(random() * pool.length);
  return pool[index]?.id;
};

export const createWeeklyTemplate = (
  ownerId: string,
  dayTags: Record<DayOfWeek, string>,
): WeeklyTemplate => ({
  id: uniqueId('template'),
  ownerId,
  days: DAYS.map((day) => ({
    day,
    tag: dayTags[day],
  })),
});

export const generateWeeklyPlan = (input: {
  ownerId: string;
  template: WeeklyTemplate;
  recipes: Recipe[];
  random?: () => number;
}): WeeklyPlan => {
  const random = input.random ?? Math.random;
  const usedRecipeIds = new Set<string>();
  const days: WeeklyPlanDay[] = input.template.days.map((templateDay) => {
    const matchingRecipes = input.recipes.filter(
      (recipe) =>
        recipe.ownerId === input.ownerId &&
        recipe.tags.some((tag) => tag.toLowerCase() === templateDay.tag.toLowerCase()),
    );
    const recipeId = chooseRecipeId(matchingRecipes, usedRecipeIds, random);
    if (recipeId) {
      usedRecipeIds.add(recipeId);
    }
    return {
      ...templateDay,
      recipeId,
    };
  });

  return {
    id: uniqueId('plan'),
    ownerId: input.ownerId,
    days,
  };
};

export const regeneratePlanDay = (input: {
  plan: WeeklyPlan;
  day: DayOfWeek;
  recipes: Recipe[];
  ownerId: string;
  random?: () => number;
}): WeeklyPlan => {
  const random = input.random ?? Math.random;
  const nextDays = input.plan.days.map((planDay) => {
    if (planDay.day !== input.day) {
      return planDay;
    }

    const alternatives = input.recipes.filter(
      (recipe) =>
        recipe.ownerId === input.ownerId &&
        recipe.id !== planDay.recipeId &&
        recipe.tags.some((tag) => tag.toLowerCase() === planDay.tag.toLowerCase()),
    );
    if (alternatives.length === 0) {
      return planDay;
    }

    return {
      ...planDay,
      recipeId: alternatives[Math.floor(random() * alternatives.length)]?.id,
    };
  });

  return {
    ...input.plan,
    days: nextDays,
  };
};

export const buildShoppingList = (
  plan: WeeklyPlan,
  recipes: Recipe[],
  pantryItems: string[],
): ShoppingListItem[] => {
  const pantry = new Set(pantryItems.map((item) => item.trim().toLowerCase()));
  const items = new Map<string, ShoppingListItem>();

  plan.days.forEach((day) => {
    const recipe = recipes.find((candidate) => candidate.id === day.recipeId);
    if (!recipe) {
      return;
    }

    recipe.ingredients.forEach((ingredient) => {
      const key = ingredient.name.trim().toLowerCase();
      if (!key || pantry.has(key)) {
        return;
      }

      const existing = items.get(key);
      if (existing) {
        existing.recipeNames.push(recipe.name);
      } else {
        items.set(key, {
          name: ingredient.name,
          recipeNames: [recipe.name],
        });
      }
    });
  });

  return Array.from(items.values()).sort((left, right) => left.name.localeCompare(right.name));
};
