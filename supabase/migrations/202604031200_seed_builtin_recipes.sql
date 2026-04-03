insert into public.recipes (
  id,
  owner_id,
  source,
  source_recipe_id,
  name,
  image_uri,
  tags,
  ingredients,
  steps,
  is_public
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    null,
    'seed',
    null,
    'Krämig tomatpasta',
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80',
    array['Vegetariskt', 'Pasta', 'Snabbt'],
    '[
      {"id":"i1","name":"Pasta"},
      {"id":"i2","name":"Krossade tomater"},
      {"id":"i3","name":"Vitlok"},
      {"id":"i4","name":"Parmesan"}
    ]'::jsonb,
    '[
      {"id":"s1","text":"Koka pastan."},
      {"id":"s2","text":"Koka ihop tomatsas och ror ned parmesan."}
    ]'::jsonb,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    null,
    'seed',
    null,
    'Ugnsbakad lax med dill',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80',
    array['Fisk'],
    '[
      {"id":"i5","name":"Laxfile"},
      {"id":"i6","name":"Citron"},
      {"id":"i7","name":"Dill"},
      {"id":"i8","name":"Potatis"}
    ]'::jsonb,
    '[
      {"id":"s3","text":"Baka laxen i ugnen."},
      {"id":"s4","text":"Servera med dill och citron."}
    ]'::jsonb,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  image_uri = excluded.image_uri,
  tags = excluded.tags,
  ingredients = excluded.ingredients,
  steps = excluded.steps,
  is_public = excluded.is_public;
