create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  pantry_items text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete cascade,
  source text not null check (source in ('seed', 'user', 'copied')),
  source_recipe_id uuid references public.recipes (id) on delete set null,
  name text not null,
  image_uri text not null,
  tags text[] not null default '{}',
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint recipes_seed_owner_check
    check (
      (source = 'seed' and owner_id is null)
      or (source <> 'seed' and owner_id is not null)
    )
);

create table if not exists public.recipe_ratings (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  value integer not null check (value between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (recipe_id, user_id)
);

create table if not exists public.recipe_comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_recipes_updated_at on public.recipes;
create trigger set_recipes_updated_at
before update on public.recipes
for each row
execute function public.set_updated_at();

drop trigger if exists set_recipe_ratings_updated_at on public.recipe_ratings;
create trigger set_recipe_ratings_updated_at
before update on public.recipe_ratings
for each row
execute function public.set_updated_at();

drop trigger if exists set_recipe_comments_updated_at on public.recipe_comments;
create trigger set_recipe_comments_updated_at
before update on public.recipe_comments
for each row
execute function public.set_updated_at();

create or replace view public.recipe_catalog as
select
  r.id,
  r.owner_id,
  r.source,
  r.source_recipe_id,
  r.name,
  r.image_uri,
  r.tags,
  r.ingredients,
  r.steps,
  r.is_public,
  coalesce(avg(rr.value)::numeric(3, 1), 0) as average_rating,
  count(distinct rc.id)::int as comment_count
from public.recipes r
left join public.recipe_ratings rr on rr.recipe_id = r.id
left join public.recipe_comments rc on rc.recipe_id = r.id
group by
  r.id,
  r.owner_id,
  r.source,
  r.source_recipe_id,
  r.name,
  r.image_uri,
  r.tags,
  r.ingredients,
  r.steps,
  r.is_public;

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ratings enable row level security;
alter table public.recipe_comments enable row level security;

drop policy if exists "profiles select own row" on public.profiles;
create policy "profiles select own row"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles insert own row" on public.profiles;
create policy "profiles insert own row"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles update own row" on public.profiles;
create policy "profiles update own row"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "recipes read public or own" on public.recipes;
create policy "recipes read public or own"
on public.recipes
for select
using (is_public = true or owner_id = auth.uid());

drop policy if exists "recipes insert own" on public.recipes;
create policy "recipes insert own"
on public.recipes
for insert
with check (
  (source = 'seed' and owner_id is null)
  or owner_id = auth.uid()
);

drop policy if exists "recipes update own" on public.recipes;
create policy "recipes update own"
on public.recipes
for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "recipes delete own" on public.recipes;
create policy "recipes delete own"
on public.recipes
for delete
using (owner_id = auth.uid());

drop policy if exists "ratings read public or own recipe" on public.recipe_ratings;
create policy "ratings read public or own recipe"
on public.recipe_ratings
for select
using (
  exists (
    select 1
    from public.recipes r
    where r.id = recipe_id
      and (r.is_public = true or r.owner_id = auth.uid())
  )
);

drop policy if exists "ratings insert own" on public.recipe_ratings;
create policy "ratings insert own"
on public.recipe_ratings
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.recipes r
    where r.id = recipe_id
      and (r.is_public = true or r.owner_id = auth.uid())
  )
);

drop policy if exists "ratings update own" on public.recipe_ratings;
create policy "ratings update own"
on public.recipe_ratings
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "comments read public or own recipe" on public.recipe_comments;
create policy "comments read public or own recipe"
on public.recipe_comments
for select
using (
  exists (
    select 1
    from public.recipes r
    where r.id = recipe_id
      and (r.is_public = true or r.owner_id = auth.uid())
  )
);

drop policy if exists "comments insert own" on public.recipe_comments;
create policy "comments insert own"
on public.recipe_comments
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.recipes r
    where r.id = recipe_id
      and (r.is_public = true or r.owner_id = auth.uid())
  )
);

drop policy if exists "comments update own" on public.recipe_comments;
create policy "comments update own"
on public.recipe_comments
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "comments delete own" on public.recipe_comments;
create policy "comments delete own"
on public.recipe_comments
for delete
using (user_id = auth.uid());
