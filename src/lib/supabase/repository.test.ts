import { loadCatalogRecipes, loadProfileById } from './repository';

describe('supabase repository', () => {
  it('loads recipe catalog rows and maps them into app recipes', async () => {
    const select = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'recipe-1',
          owner_id: null,
          source: 'seed',
          source_recipe_id: null,
          name: 'Tomatpasta',
          image_uri: 'https://example.com/pasta.jpg',
          tags: ['Vegetariskt'],
          ingredients: [{ id: 'i1', name: 'Pasta' }],
          steps: [{ id: 's1', text: 'Koka pasta.' }],
          is_public: true,
          average_rating: 4.5,
          comment_count: 2,
        },
      ],
      error: null,
    });
    const order = jest.fn(() => select());
    const from = jest.fn(() => ({ select: jest.fn(() => ({ order })) }));
    const client = { from };

    const recipes = await loadCatalogRecipes(client as never);

    expect(from).toHaveBeenCalledWith('recipe_catalog');
    expect(order).toHaveBeenCalledWith('name');
    expect(recipes[0]).toMatchObject({
      id: 'recipe-1',
      name: 'Tomatpasta',
      averageRating: 4.5,
      commentCount: 2,
    });
  });

  it('throws when catalog loading fails', async () => {
    const select = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'permission denied' },
    });
    const order = jest.fn(() => select());
    const from = jest.fn(() => ({ select: jest.fn(() => ({ order })) }));
    const client = { from };

    await expect(loadCatalogRecipes(client as never)).rejects.toThrow('permission denied');
  });

  it('loads a user profile by id', async () => {
    const single = jest.fn().mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'fredrik@example.com',
        display_name: 'Fredrik',
        pantry_items: ['salt'],
      },
      error: null,
    });
    const eq = jest.fn(() => ({ single }));
    const select = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ select }));
    const client = { from };

    const profile = await loadProfileById(client as never, 'user-1');

    expect(from).toHaveBeenCalledWith('profiles');
    expect(profile).toEqual({
      id: 'user-1',
      email: 'fredrik@example.com',
      name: 'Fredrik',
      pantryItems: ['salt'],
    });
  });

  it('returns null when the profile row does not exist', async () => {
    const single = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const eq = jest.fn(() => ({ single }));
    const select = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ select }));
    const client = { from };

    const profile = await loadProfileById(client as never, 'missing-user');

    expect(profile).toBeNull();
  });
});
