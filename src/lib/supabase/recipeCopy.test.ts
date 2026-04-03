import type { Recipe } from '../../domain/types';

import { copyRecipeRecord } from './recipeCopy';

describe('supabase recipe copy', () => {
  it('copies a source recipe into the users private library', async () => {
    const sourceRecipe: Recipe = {
      id: 'seed-1',
      ownerId: null,
      source: 'seed',
      name: 'Tomatpasta',
      imageUri: 'https://example.com/pasta.jpg',
      tags: ['Vegetariskt'],
      ingredients: [{ id: 'i1', name: 'Pasta' }],
      steps: [{ id: 's1', text: 'Koka pasta.' }],
      isPublic: true,
      ratingEntries: [],
      comments: [],
      averageRating: 4.5,
      commentCount: 2,
    };

    const select = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'copy-1',
          owner_id: 'user-1',
          source: 'copied',
          source_recipe_id: 'seed-1',
          name: 'Tomatpasta',
          image_uri: 'https://example.com/pasta.jpg',
          tags: ['Vegetariskt'],
          ingredients: [{ id: 'i1', name: 'Pasta' }],
          steps: [{ id: 's1', text: 'Koka pasta.' }],
          is_public: false,
        },
      ],
      error: null,
    });
    const insert = jest.fn(() => ({ select }));
    const from = jest.fn(() => ({ insert }));
    const client = { from };

    const copied = await copyRecipeRecord(client as never, sourceRecipe, 'user-1');

    expect(from).toHaveBeenCalledWith('recipes');
    expect(insert).toHaveBeenCalledWith({
      id: expect.any(String),
      owner_id: 'user-1',
      source: 'copied',
      source_recipe_id: 'seed-1',
      name: 'Tomatpasta',
      image_uri: 'https://example.com/pasta.jpg',
      tags: ['Vegetariskt'],
      ingredients: [{ id: 'i1', name: 'Pasta' }],
      steps: [{ id: 's1', text: 'Koka pasta.' }],
      is_public: false,
    });
    expect(copied).toMatchObject({
      id: 'copy-1',
      ownerId: 'user-1',
      source: 'copied',
      sourceRecipeId: 'seed-1',
      isPublic: false,
    });
  });
});
