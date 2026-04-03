import { addRecipeCommentRecord, upsertRecipeRatingRecord } from './recipeFeedback';

describe('supabase recipe feedback', () => {
  it('upserts a recipe rating for the current user', async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn(() => ({ upsert }));
    const client = { from };

    await upsertRecipeRatingRecord(client as never, {
      recipeId: 'recipe-1',
      userId: 'user-1',
      value: 5,
    });

    expect(from).toHaveBeenCalledWith('recipe_ratings');
    expect(upsert).toHaveBeenCalledWith({
      recipe_id: 'recipe-1',
      user_id: 'user-1',
      value: 5,
    });
  });

  it('inserts a recipe comment for the current user', async () => {
    const select = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'comment-1',
          recipe_id: 'recipe-1',
          user_id: 'user-1',
          body: 'Jattegod!',
          created_at: '2026-04-03T18:00:00.000Z',
          profiles: { display_name: 'Fredrik' },
        },
      ],
      error: null,
    });
    const insert = jest.fn(() => ({ select }));
    const from = jest.fn(() => ({ insert }));
    const client = { from };

    const comment = await addRecipeCommentRecord(client as never, {
      recipeId: 'recipe-1',
      userId: 'user-1',
      authorName: 'Fredrik',
      text: 'Jattegod!',
    });

    expect(from).toHaveBeenCalledWith('recipe_comments');
    expect(insert).toHaveBeenCalledWith({
      recipe_id: 'recipe-1',
      user_id: 'user-1',
      body: 'Jattegod!',
    });
    expect(comment).toEqual({
      id: 'comment-1',
      recipeId: 'recipe-1',
      authorId: 'user-1',
      authorName: 'Fredrik',
      text: 'Jattegod!',
      createdAt: '2026-04-03T18:00:00.000Z',
    });
  });
});
