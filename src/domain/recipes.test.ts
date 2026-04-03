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
} from './recipes';
import { communityRecipes, seedRecipes } from './seedData';
import type { DayOfWeek, Recipe } from './types';

describe('recipe domain', () => {
  it('separates built-in recipes from community recipes in discover', () => {
    const sections = buildDiscoverSections(
      [...seedRecipes, ...communityRecipes],
      'current-user',
    );

    expect(sections.builtIn).toHaveLength(2);
    expect(sections.community).toHaveLength(1);
    expect(sections.community[0]?.name).toBe('Tacofredag deluxe');
  });

  it('copies a seed recipe into the users private library', () => {
    const copied = copyRecipeToLibrary(seedRecipes, 'seed-1', 'user-1');
    const recipe = copied[0];

    expect(recipe.ownerId).toBe('user-1');
    expect(recipe.source).toBe('copied');
    expect(recipe.sourceRecipeId).toBe('seed-1');
    expect(recipe.isPublic).toBe(false);
  });

  it('stores one active rating per user and recalculates the average', () => {
    const updated = upsertRecipeRating(seedRecipes[0], {
      recipeId: 'seed-1',
      userId: 'new-user',
      value: 3,
    });

    expect(updated.ratingEntries).toHaveLength(3);
    expect(averageRating(updated)).toBe(4);
  });

  it('adds a public comment to a recipe', () => {
    const commented = addRecipeComment(seedRecipes[0], {
      recipeId: 'seed-1',
      authorId: 'user-2',
      authorName: 'Alex',
      text: 'Bra att forbereda dagen innan.',
    });

    expect(commented.comments[0]?.authorName).toBe('Alex');
    expect(commented.comments[0]?.text).toContain('forbereda');
  });

  it('creates a weekly plan that only uses matching recipe tags', () => {
    const profile = createProfile('Maja', 'maja@example.com');
    const recipes: Recipe[] = [
      createRecipe({
        ownerId: profile.id,
        name: 'Vegobiffar',
        tags: ['Vegetariskt'],
        ingredients: ['Kikartor'],
        steps: ['Mixa och stek'],
        isPublic: false,
      }),
      createRecipe({
        ownerId: profile.id,
        name: 'Fiskgryta',
        tags: ['Fisk'],
        ingredients: ['Torsk'],
        steps: ['Koka'],
        isPublic: false,
      }),
    ];
    const tags: Record<DayOfWeek, string> = {
      Mondag: 'Vegetariskt',
      Tisdag: 'Fisk',
      Onsdag: 'Vegetariskt',
      Torsdag: 'Fisk',
      Fredag: 'Fredagsmys',
      Lordag: 'Vegetariskt',
      Sondag: 'Fisk',
    };

    const template = createWeeklyTemplate(profile.id, tags);
    const plan = generateWeeklyPlan({
      ownerId: profile.id,
      template,
      recipes,
      random: () => 0,
    });

    expect(plan.days.find((day) => day.day === 'Mondag')?.recipeId).toBe(recipes[0]?.id);
    expect(plan.days.find((day) => day.day === 'Tisdag')?.recipeId).toBe(recipes[1]?.id);
    expect(plan.days.find((day) => day.day === 'Fredag')?.recipeId).toBeUndefined();
  });

  it('regenerates a single day without changing the others', () => {
    const profile = createProfile('Maja', 'maja@example.com');
    const recipes: Recipe[] = [
      createRecipe({
        ownerId: profile.id,
        name: 'Tacogratang',
        tags: ['Fredagsmys'],
        ingredients: ['Kottfars'],
        steps: ['Gratinera'],
        isPublic: false,
      }),
      createRecipe({
        ownerId: profile.id,
        name: 'Tacos',
        tags: ['Fredagsmys'],
        ingredients: ['Kottfars'],
        steps: ['Stek och servera'],
        isPublic: false,
      }),
    ];
    const template = createWeeklyTemplate(profile.id, {
      Mondag: 'Fredagsmys',
      Tisdag: 'Fredagsmys',
      Onsdag: 'Fredagsmys',
      Torsdag: 'Fredagsmys',
      Fredag: 'Fredagsmys',
      Lordag: 'Fredagsmys',
      Sondag: 'Fredagsmys',
    });
    const plan = generateWeeklyPlan({
      ownerId: profile.id,
      template,
      recipes,
      random: () => 0,
    });

    const regenerated = regeneratePlanDay({
      ownerId: profile.id,
      plan,
      day: 'Mondag',
      recipes,
      random: () => 0,
    });

    expect(regenerated.days.find((day) => day.day === 'Mondag')?.recipeId).toBe(recipes[1]?.id);
    expect(regenerated.days.find((day) => day.day === 'Tisdag')?.recipeId).toBe(
      plan.days.find((day) => day.day === 'Tisdag')?.recipeId,
    );
  });

  it('builds a shopping list without pantry items', () => {
    const profile = createProfile('Maja', 'maja@example.com');
    const recipe = createRecipe({
      ownerId: profile.id,
      name: 'Pastasallad',
      tags: ['Vegetariskt'],
      ingredients: ['Pasta', 'Tomater', 'Olivolja'],
      steps: ['Blanda ihop'],
      isPublic: false,
    });
    const template = createWeeklyTemplate(profile.id, {
      Mondag: 'Vegetariskt',
      Tisdag: 'Vegetariskt',
      Onsdag: 'Vegetariskt',
      Torsdag: 'Vegetariskt',
      Fredag: 'Vegetariskt',
      Lordag: 'Vegetariskt',
      Sondag: 'Vegetariskt',
    });
    const plan = generateWeeklyPlan({
      ownerId: profile.id,
      template,
      recipes: [recipe],
      random: () => 0,
    });

    const shoppingList = buildShoppingList(plan, [recipe], ['olivolja']);

    expect(shoppingList.map((item) => item.name)).toEqual(['Pasta', 'Tomater']);
  });
});
