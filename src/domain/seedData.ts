import type { Recipe } from './types';

export const seedRecipes: Recipe[] = [
  {
    id: 'seed-1',
    ownerId: null,
    source: 'seed',
    name: 'Krämig tomatpasta',
    imageUri:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80',
    tags: ['Vegetariskt', 'Pasta', 'Snabbt'],
    ingredients: [
      { id: 'i1', name: 'Pasta' },
      { id: 'i2', name: 'Krossade tomater' },
      { id: 'i3', name: 'Vitlok' },
      { id: 'i4', name: 'Parmesan' },
    ],
    steps: [
      { id: 's1', text: 'Koka pastan.' },
      { id: 's2', text: 'Koka ihop tomatsas och ror ned parmesan.' },
    ],
    isPublic: true,
    ratingEntries: [
      { recipeId: 'seed-1', userId: 'seed-user-1', value: 5 },
      { recipeId: 'seed-1', userId: 'seed-user-2', value: 4 },
    ],
    comments: [
      {
        id: 'c1',
        recipeId: 'seed-1',
        authorId: 'seed-user-1',
        authorName: 'Sara',
        text: 'Perfekt vardagsratt.',
        createdAt: '2026-03-30T18:00:00.000Z',
      },
    ],
  },
  {
    id: 'seed-2',
    ownerId: null,
    source: 'seed',
    name: 'Ugnsbakad lax med dill',
    imageUri:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80',
    tags: ['Fisk'],
    ingredients: [
      { id: 'i5', name: 'Laxfile' },
      { id: 'i6', name: 'Citron' },
      { id: 'i7', name: 'Dill' },
      { id: 'i8', name: 'Potatis' },
    ],
    steps: [
      { id: 's3', text: 'Baka laxen i ugnen.' },
      { id: 's4', text: 'Servera med dill och citron.' },
    ],
    isPublic: true,
    ratingEntries: [{ recipeId: 'seed-2', userId: 'seed-user-3', value: 4 }],
    comments: [],
  },
];

export const communityRecipes: Recipe[] = [
  {
    id: 'community-1',
    ownerId: 'community-user-1',
    source: 'user',
    name: 'Tacofredag deluxe',
    imageUri:
      'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80',
    tags: ['Fredagsmys', 'Kott'],
    ingredients: [
      { id: 'i9', name: 'Notfars' },
      { id: 'i10', name: 'Tacokrydda' },
      { id: 'i11', name: 'Tortillabrod' },
    ],
    steps: [
      { id: 's5', text: 'Stek farsen med krydda.' },
      { id: 's6', text: 'Servera med tillbehor.' },
    ],
    isPublic: true,
    ratingEntries: [{ recipeId: 'community-1', userId: 'seed-user-4', value: 5 }],
    comments: [
      {
        id: 'c2',
        recipeId: 'community-1',
        authorId: 'seed-user-5',
        authorName: 'Jonas',
        text: 'Barnen alskar den.',
        createdAt: '2026-03-28T18:00:00.000Z',
      },
    ],
  },
];
