-- Run this entire file once in Supabase → SQL Editor → New query → Run
-- https://supabase.com/dashboard/project/_/sql

-- =============================================================================
-- Migration 001: Core schema
-- =============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_name text,
  logo_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  address text not null,
  customer_name text,
  latitude double precision,
  longitude double precision,
  map_bounds jsonb,
  wizard_step int not null default 1 check (wizard_step between 1 and 5),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  share_slug text unique,
  is_public boolean not null default false,
  stylized_image_url text,
  source_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_user_id_idx on public.properties (user_id);
create index if not exists properties_share_slug_idx on public.properties (share_slug) where share_slug is not null;

create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  name text not null,
  geometry jsonb not null,
  vegetation_type text check (vegetation_type in ('grass', 'shrubs', 'trees', 'flower_bed')),
  shade_level text check (shade_level in ('full_sun', 'some_shade', 'lots_of_shade')),
  slope_level text check (slope_level in ('flat', 'moderate', 'steep')),
  soil_type text check (soil_type in ('sand', 'clay', 'loam')),
  irrigation_type text check (irrigation_type in ('spray', 'rotary', 'rotor', 'drip', 'bubbler')),
  nozzle_count int,
  nozzle_gpm numeric(6, 2),
  estimated_gpm numeric(6, 2),
  base_runtime_minutes numeric(6, 2),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists zones_property_id_idx on public.zones (property_id);

create table if not exists public.valves (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  label text not null,
  geometry jsonb not null,
  zone_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists valves_property_id_idx on public.valves (property_id);

create table if not exists public.controllers (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  label text not null,
  geometry jsonb not null,
  station_count int not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists controllers_property_id_idx on public.controllers (property_id);

create table if not exists public.zone_stations (
  id uuid primary key default gen_random_uuid(),
  controller_id uuid not null references public.controllers (id) on delete cascade,
  station_number int not null check (station_number > 0),
  zone_id uuid not null references public.zones (id) on delete cascade,
  unique (controller_id, station_number)
);

create index if not exists zone_stations_controller_id_idx on public.zone_stations (controller_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, company_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'company_name', 'My Company'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for users who signed up before this migration
insert into public.profiles (id, company_name)
select id, coalesce(raw_user_meta_data ->> 'company_name', 'My Company')
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- Updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
drop trigger if exists properties_updated_at on public.properties;
create trigger properties_updated_at before update on public.properties
  for each row execute procedure public.set_updated_at();
drop trigger if exists zones_updated_at on public.zones;
create trigger zones_updated_at before update on public.zones
  for each row execute procedure public.set_updated_at();
drop trigger if exists valves_updated_at on public.valves;
create trigger valves_updated_at before update on public.valves
  for each row execute procedure public.set_updated_at();
drop trigger if exists controllers_updated_at on public.controllers;
create trigger controllers_updated_at before update on public.controllers
  for each row execute procedure public.set_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.zones enable row level security;
alter table public.valves enable row level security;
alter table public.controllers enable row level security;
alter table public.zone_stations enable row level security;

-- Profiles policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Public can view profiles of published properties" on public.profiles;
create policy "Public can view profiles of published properties"
  on public.profiles for select
  using (
    exists (
      select 1 from public.properties p
      where p.user_id = profiles.id and p.is_public = true
    )
  );

-- Properties policies
drop policy if exists "Users can manage own properties" on public.properties;
create policy "Users can manage own properties"
  on public.properties for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Public can view published properties" on public.properties;
create policy "Public can view published properties"
  on public.properties for select
  using (is_public = true);

-- Zones policies
drop policy if exists "Users can manage zones on own properties" on public.zones;
create policy "Users can manage zones on own properties"
  on public.zones for all
  using (
    exists (
      select 1 from public.properties p
      where p.id = zones.property_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = zones.property_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Public can view zones of published properties" on public.zones;
create policy "Public can view zones of published properties"
  on public.zones for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = zones.property_id and p.is_public = true
    )
  );

-- Valves policies
drop policy if exists "Users can manage valves on own properties" on public.valves;
create policy "Users can manage valves on own properties"
  on public.valves for all
  using (
    exists (
      select 1 from public.properties p
      where p.id = valves.property_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = valves.property_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Public can view valves of published properties" on public.valves;
create policy "Public can view valves of published properties"
  on public.valves for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = valves.property_id and p.is_public = true
    )
  );

-- Controllers policies
drop policy if exists "Users can manage controllers on own properties" on public.controllers;
create policy "Users can manage controllers on own properties"
  on public.controllers for all
  using (
    exists (
      select 1 from public.properties p
      where p.id = controllers.property_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = controllers.property_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Public can view controllers of published properties" on public.controllers;
create policy "Public can view controllers of published properties"
  on public.controllers for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = controllers.property_id and p.is_public = true
    )
  );

-- Zone stations policies
drop policy if exists "Users can manage zone stations on own properties" on public.zone_stations;
create policy "Users can manage zone stations on own properties"
  on public.zone_stations for all
  using (
    exists (
      select 1 from public.controllers c
      join public.properties p on p.id = c.property_id
      where c.id = zone_stations.controller_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.controllers c
      join public.properties p on p.id = c.property_id
      where c.id = zone_stations.controller_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "Public can view zone stations of published properties" on public.zone_stations;
create policy "Public can view zone stations of published properties"
  on public.zone_stations for select
  using (
    exists (
      select 1 from public.controllers c
      join public.properties p on p.id = c.property_id
      where c.id = zone_stations.controller_id and p.is_public = true
    )
  );

-- =============================================================================
-- Migration 002: Storage for property images
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload own property images" on storage.objects;
create policy "Authenticated users can upload own property images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users can update own property images" on storage.objects;
create policy "Authenticated users can update own property images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users can delete own property images" on storage.objects;
create policy "Authenticated users can delete own property images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Public read property images" on storage.objects;
create policy "Public read property images"
  on storage.objects for select
  to public
  using (bucket_id = 'property-images');
