import type { Recipe, UserProfile } from '../../domain/types';

import {
  fromProfileRow,
  fromRecipeRow,
  toProfileRow,
  toRecipeRow,
} from './records';

describe('supabase record mapping', () => {
  it('maps a user profile to a database row', () => {
    const profile: UserProfile = {
      id: 'user-1',
      name: 'Fredrik',
      email: 'fredrik@example.com',
      pantryItems: ['salt', 'peppar'],
    };

    expect(toProfileRow(profile)).toEqual({
      id: 'user-1',
      display_name: 'Fredrik',
      pantry_items: ['salt', 'peppar'],
    });
  });

  it('maps a database profile row back to the app profile shape', () => {
    expect(
      fromProfileRow({
        id: 'user-1',
        email: 'fredrik@example.com',
        display_name: 'Fredrik',
        pantry_items: ['salt', 'peppar'],
      }),
    ).toEqual({
      id: 'user-1',
      name: 'Fredrik',
      email: 'fredrik@example.com',
      pantryItems: ['salt', 'peppar'],
    });
  });

  it('maps a recipe into a recipes table row', () => {
    const recipe: Recipe = {
      id: 'recipe-1',
      ownerId: 'user-1',
      source: 'copied',
      sourceRecipeId: 'seed-1',
      name: 'Tomatpasta',
      imageUri: 'https://example.com/pasta.jpg',
      tags: ['Vegetariskt', 'Pasta'],
      ingredients: [
        { id: 'i1', name: 'Pasta' },
        { id: 'i2', name: 'Tomater', amount: '2', unit: 'st' },
      ],
      steps: [
        { id: 's1', text: 'Koka pasta.' },
        { id: 's2', text: 'Blanda med sas.' },
      ],
      isPublic: true,
      ratingEntries: [],
      comments: [],
    };

    expect(toRecipeRow(recipe)).toEqual({
      id: 'recipe-1',
      owner_id: 'user-1',
      source: 'copied',
      source_recipe_id: 'seed-1',
      name: 'Tomatpasta',
      image_uri: 'https://example.com/pasta.jpg',
      tags: ['Vegetariskt', 'Pasta'],
      ingredients: [
        { id: 'i1', name: 'Pasta' },
        { id: 'i2', name: 'Tomater', amount: '2', unit: 'st' },
      ],
      steps: [
        { id: 's1', text: 'Koka pasta.' },
        { id: 's2', text: 'Blanda med sas.' },
      ],
      is_public: true,
    });
  });

  it('maps a recipes table row back into the app recipe shape', () => {
    expect(
      fromRecipeRow({
        id: 'recipe-1',
        owner_id: 'user-1',
        source: 'seed',
        source_recipe_id: null,
        name: 'Tomatpasta',
        image_uri: 'https://example.com/pasta.jpg',
        tags: ['Vegetariskt'],
        ingredients: [{ id: 'i1', name: 'Pasta' }],
        steps: [{ id: 's1', text: 'Koka pasta.' }],
        is_public: true,
        average_rating: 4.5,
        comment_count: 3,
      }),
    ).toEqual({
      id: 'recipe-1',
      ownerId: 'user-1',
      source: 'seed',
      sourceRecipeId: undefined,
      name: 'Tomatpasta',
      imageUri: 'https://example.com/pasta.jpg',
      tags: ['Vegetariskt'],
      ingredients: [{ id: 'i1', name: 'Pasta' }],
      steps: [{ id: 's1', text: 'Koka pasta.' }],
      isPublic: true,
      ratingEntries: [],
      comments: [],
      averageRating: 4.5,
      commentCount: 3,
    });
  });
});
