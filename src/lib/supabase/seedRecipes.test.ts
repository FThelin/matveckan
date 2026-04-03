import { buildSeedRecipeRows } from './seedRecipes';

describe('supabase seed recipes', () => {
  it('maps built-in seed recipes into database insert rows', () => {
    const rows = buildSeedRecipeRows();

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      source: 'seed',
      owner_id: null,
      is_public: true,
      name: 'Krämig tomatpasta',
    });
    expect(rows[1]).toMatchObject({
      source: 'seed',
      owner_id: null,
      is_public: true,
      name: 'Ugnsbakad lax med dill',
    });
  });
});
