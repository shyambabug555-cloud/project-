-- ============================================================
-- Photo Album — Supabase Migration
-- Run this SQL in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Categories
create table if not exists public.categories (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  slug        text not null unique,
  icon        text not null default '',
  description text not null default '',
  created_at  timestamptz not null default now()
);

-- 2. Photos
create table if not exists public.photos (
  id             text primary key default gen_random_uuid()::text,
  filename       text not null,
  src            text not null,
  thumbnail_src  text not null,
  width          int not null default 0,
  height         int not null default 0,
  file_size      text,
  mime_type      text not null default 'image/jpeg',
  is_favorite    boolean not null default false,
  tags           text[] not null default '{}',
  dimensions     text,
  camera         text,
  location       text,
  lens           text,
  created_at     timestamptz not null default now(),
  uploaded_at    timestamptz not null default now()
);

-- 3. Albums
create table if not exists public.albums (
  id             text primary key default gen_random_uuid()::text,
  name           text not null,
  description    text not null default '',
  cover_photo_id text references public.photos(id) on delete set null,
  is_featured    boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 4. Persons
create table if not exists public.persons (
  id         text primary key default gen_random_uuid()::text,
  name       text not null,
  created_at timestamptz not null default now()
);

-- 5. Junction: photo <-> category
create table if not exists public.photo_categories (
  photo_id    text not null references public.photos(id) on delete cascade,
  category_id text not null references public.categories(id) on delete cascade,
  primary key (photo_id, category_id)
);

-- 6. Junction: photo <-> album
create table if not exists public.photo_albums (
  photo_id text not null references public.photos(id) on delete cascade,
  album_id text not null references public.albums(id) on delete cascade,
  primary key (photo_id, album_id)
);

-- 7. Junction: photo <-> person
create table if not exists public.photo_persons (
  photo_id  text not null references public.photos(id) on delete cascade,
  person_id text not null references public.persons(id) on delete cascade,
  primary key (photo_id, person_id)
);

-- Indexes for faster queries
create index if not exists idx_photos_is_favorite on public.photos(is_favorite);
create index if not exists idx_photos_created_at  on public.photos(created_at desc);
create index if not exists idx_albums_is_featured on public.albums(is_featured);
create index if not exists idx_categories_slug    on public.categories(slug);

-- Enable Row Level Security. Public users can read until authentication is configured.
alter table public.categories enable row level security;
alter table public.photos enable row level security;
alter table public.albums enable row level security;
alter table public.persons enable row level security;
alter table public.photo_categories enable row level security;
alter table public.photo_albums enable row level security;
alter table public.photo_persons enable row level security;

-- The frontend uses the publishable key, which maps to the anon role.
grant usage on schema public to anon, authenticated;
grant select on
  public.categories,
  public.photos,
  public.albums,
  public.persons,
  public.photo_categories,
  public.photo_albums,
  public.photo_persons
to anon, authenticated;

-- Public read-only policies. Remove any older permissive policies if this migration is rerun.
drop policy if exists "Allow public read categories" on public.categories;
drop policy if exists "Allow public insert categories" on public.categories;
drop policy if exists "Allow public update categories" on public.categories;
drop policy if exists "Allow public delete categories" on public.categories;
create policy "Allow public read categories" on public.categories for select using (true);

drop policy if exists "Allow public read photos" on public.photos;
drop policy if exists "Allow public insert photos" on public.photos;
drop policy if exists "Allow public update photos" on public.photos;
drop policy if exists "Allow public delete photos" on public.photos;
create policy "Allow public read photos" on public.photos for select using (true);

drop policy if exists "Allow public read albums" on public.albums;
drop policy if exists "Allow public insert albums" on public.albums;
drop policy if exists "Allow public update albums" on public.albums;
drop policy if exists "Allow public delete albums" on public.albums;
create policy "Allow public read albums" on public.albums for select using (true);

drop policy if exists "Allow public read persons" on public.persons;
drop policy if exists "Allow public insert persons" on public.persons;
drop policy if exists "Allow public update persons" on public.persons;
drop policy if exists "Allow public delete persons" on public.persons;
create policy "Allow public read persons" on public.persons for select using (true);

drop policy if exists "Allow public read photo_categories" on public.photo_categories;
drop policy if exists "Allow public insert photo_categories" on public.photo_categories;
drop policy if exists "Allow public delete photo_categories" on public.photo_categories;
create policy "Allow public read photo_categories" on public.photo_categories for select using (true);

drop policy if exists "Allow public read photo_albums" on public.photo_albums;
drop policy if exists "Allow public insert photo_albums" on public.photo_albums;
drop policy if exists "Allow public delete photo_albums" on public.photo_albums;
create policy "Allow public read photo_albums" on public.photo_albums for select using (true);

drop policy if exists "Allow public read photo_persons" on public.photo_persons;
drop policy if exists "Allow public insert photo_persons" on public.photo_persons;
drop policy if exists "Allow public delete photo_persons" on public.photo_persons;
create policy "Allow public read photo_persons" on public.photo_persons for select using (true);

-- Refresh PostgREST's schema cache so the API sees the newly-created tables.
notify pgrst, 'reload schema';
