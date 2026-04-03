import type { Recipe } from '../../domain/types';

import { createRecipeRecord, loadOwnedRecipes } from './recipeMutations';

describe('supabase recipe mutations', () => {
  const recipe: Recipe = {
    id: 'recipe-1',
    ownerId: 'user-1',
    source: 'user',
    name: 'Pastagratang',
    imageUri: 'https://example.com/pasta.jpg',
    tags: ['Pasta', 'Vegetariskt'],
    ingredients: [{ id: 'i1', name: 'Pasta' }],
    steps: [{ id: 's1', text: 'Koka pasta.' }],
    isPublic: true,
    ratingEntries: [],
    comments: [],
  };

  it('inserts a new recipe row into Supabase', async () => {
    const select = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'recipe-1',
          owner_id: 'user-1',
          source: 'user',
          source_recipe_id: null,
          name: 'Pastagratang',
          image_uri: 'https://example.com/pasta.jpg',
          tags: ['Pasta', 'Vegetariskt'],
          ingredients: [{ id: 'i1', name: 'Pasta' }],
          steps: [{ id: 's1', text: 'Koka pasta.' }],
          is_public: true,
        },
      ],
      error: null,
    });
    const insert = jest.fn(() => ({ select }));
    const from = jest.fn(() => ({ insert }));
    const client = { from };

    const saved = await createRecipeRecord(client as never, recipe);

    expect(from).toHaveBeenCalledWith('recipes');
    expect(insert).toHaveBeenCalledWith({
      id: 'recipe-1',
      owner_id: 'user-1',
      source: 'user',
      source_recipe_id: null,
      name: 'Pastagratang',
      image_uri: 'https://example.com/pasta.jpg',
      tags: ['Pasta', 'Vegetariskt'],
      ingredients: [{ id: 'i1', name: 'Pasta' }],
      steps: [{ id: 's1', text: 'Koka pasta.' }],
      is_public: true,
    });
    expect(saved.name).toBe('Pastagratang');
  });

  it('loads recipes owned by the current user', async () => {
    const order = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'recipe-1',
          owner_id: 'user-1',
          source: 'user',
          source_recipe_id: null,
          name: 'Pastagratang',
          image_uri: 'https://example.com/pasta.jpg',
          tags: ['Pasta'],
          ingredients: [{ id: 'i1', name: 'Pasta' }],
          steps: [{ id: 's1', text: 'Koka pasta.' }],
          is_public: true,
        },
      ],
      error: null,
    });
    const eq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ select }));
    const client = { from };

    const recipes = await loadOwnedRecipes(client as never, 'user-1');

    expect(from).toHaveBeenCalledWith('recipes');
    expect(recipes).toHaveLength(1);
    expect(recipes[0]?.ownerId).toBe('user-1');
  });
});
