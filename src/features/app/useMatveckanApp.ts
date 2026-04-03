import { useMemo, useState } from 'react';

import { DAYS, DEFAULT_TAGS } from '../../domain/constants';
import {
  addRecipeComment,
  averageRating,
  buildDiscoverSections,
  buildShoppingList,
  copyRecipeToLibrary,
  createProfile,
  createRecipe,
  createWeeklyTemplate,
  generateWeeklyPlan,
  regeneratePlanDay,
  upsertRecipeRating,
} from '../../domain/recipes';
import { communityRecipes, seedRecipes } from '../../domain/seedData';
import type { DayOfWeek, Recipe, UserProfile, WeeklyPlan } from '../../domain/types';

const createInitialTemplateTags = (): Record<DayOfWeek, string> => ({
  Mondag: 'Vegetariskt',
  Tisdag: 'Fisk',
  Onsdag: 'Vegetariskt',
  Torsdag: 'Kott',
  Fredag: 'Fredagsmys',
  Lordag: 'Pasta',
  Sondag: 'Vegetariskt',
});

export const useMatveckanApp = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([...seedRecipes, ...communityRecipes]);
  const [templateTags, setTemplateTags] = useState<Record<DayOfWeek, string>>(createInitialTemplateTags);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [selectedDiscoverRecipeId, setSelectedDiscoverRecipeId] = useState<string | null>(
    seedRecipes[0]?.id ?? null,
  );

  const currentUser = profiles.find((profile) => profile.id === currentUserId) ?? null;
  const libraryRecipes = recipes.filter((recipe) => recipe.ownerId === currentUserId);
  const discoverSections = buildDiscoverSections(recipes, currentUserId ?? '');
  const selectedDiscoverRecipe = recipes.find((recipe) => recipe.id === selectedDiscoverRecipeId) ?? null;
  const shoppingList = weeklyPlan
    ? buildShoppingList(weeklyPlan, recipes, currentUser?.pantryItems ?? [])
    : [];

  const publicRecipeCount = useMemo(
    () => libraryRecipes.filter((recipe) => recipe.isPublic).length,
    [libraryRecipes],
  );

  return {
    currentUser,
    currentUserId,
    days: DAYS,
    defaultTags: DEFAULT_TAGS,
    discoverSections,
    libraryRecipes,
    profiles,
    publicRecipeCount,
    recipes,
    selectedDiscoverRecipe,
    shoppingList,
    templateTags,
    weeklyPlan,
    signIn: (name: string, email: string) => {
      const profile = createProfile(name, email);
      setProfiles((current) => [...current, profile]);
      setCurrentUserId(profile.id);
      return profile;
    },
    addRecipe: (input: {
      name: string;
      imageUri?: string;
      tags: string[];
      ingredients: string[];
      steps: string[];
      isPublic: boolean;
    }) => {
      if (!currentUserId) {
        return;
      }

      const recipe = createRecipe({
        ownerId: currentUserId,
        ...input,
      });
      setRecipes((current) => [recipe, ...current]);
    },
    copyRecipe: (recipeId: string) => {
      if (!currentUserId) {
        return;
      }

      setRecipes((current) => copyRecipeToLibrary(current, recipeId, currentUserId));
    },
    rateRecipe: (recipeId: string, value: 1 | 2 | 3 | 4 | 5) => {
      if (!currentUserId) {
        return;
      }

      setRecipes((current) =>
        current.map((recipe) =>
          recipe.id === recipeId
            ? upsertRecipeRating(recipe, { recipeId, userId: currentUserId, value })
            : recipe,
        ),
      );
    },
    commentRecipe: (recipeId: string, text: string) => {
      if (!currentUser || !text.trim()) {
        return;
      }

      setRecipes((current) =>
        current.map((recipe) =>
          recipe.id === recipeId
            ? addRecipeComment(recipe, {
                recipeId,
                authorId: currentUser.id,
                authorName: currentUser.name,
                text: text.trim(),
              })
            : recipe,
        ),
      );
    },
    averageRating,
    selectDiscoverRecipe: setSelectedDiscoverRecipeId,
    setTemplateTag: (day: DayOfWeek, tag: string) => {
      setTemplateTags((current) => ({ ...current, [day]: tag }));
    },
    generatePlan: () => {
      if (!currentUserId) {
        return;
      }

      const template = createWeeklyTemplate(currentUserId, templateTags);
      const plan = generateWeeklyPlan({
        ownerId: currentUserId,
        template,
        recipes,
      });
      setWeeklyPlan(plan);
    },
    regenerateDay: (day: DayOfWeek) => {
      if (!currentUserId || !weeklyPlan) {
        return;
      }

      setWeeklyPlan(
        regeneratePlanDay({
          ownerId: currentUserId,
          plan: weeklyPlan,
          day,
          recipes,
        }),
      );
    },
    addPantryItem: (name: string) => {
      if (!currentUserId || !name.trim()) {
        return;
      }

      setProfiles((current) =>
        current.map((profile) =>
          profile.id === currentUserId
            ? {
                ...profile,
                pantryItems: [...profile.pantryItems, name.trim().toLowerCase()],
              }
            : profile,
        ),
      );
    },
  };
};
