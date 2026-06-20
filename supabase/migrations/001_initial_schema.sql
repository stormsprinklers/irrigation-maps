-- Irrigation Maps initial schema

create extension if not exists "pgcrypto";

-- Profiles (contractors)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_name text,
  logo_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Properties
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  address text not null,
  customer_name text,
  latitude double precision,
  longitude double precision,
  map_bounds jsonb,
  wizard_step int not null default 1 check (wizard_step between 1 and 6),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  share_slug text unique,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_user_id_idx on public.properties (user_id);
create index properties_share_slug_idx on public.properties (share_slug) where share_slug is not null;

-- Irrigation zones
create table public.zones (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  name text not null,
  geometry jsonb not null,
  vegetation_type text check (vegetation_type in ('turf', 'shrubs', 'trees', 'groundcover', 'mixed')),
  shade_level text check (shade_level in ('full_sun', 'partial_shade', 'full_shade')),
  soil_type text check (soil_type in ('clay', 'loam', 'sand', 'rocky')),
  irrigation_type text check (irrigation_type in ('spray', 'rotor', 'rotary_nozzle', 'drip', 'bubbler')),
  nozzle_count int,
  nozzle_gpm numeric(6, 2),
  estimated_gpm numeric(6, 2),
  base_runtime_minutes numeric(6, 2),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index zones_property_id_idx on public.zones (property_id);

-- Valves
create table public.valves (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  label text not null,
  geometry jsonb not null,
  zone_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index valves_property_id_idx on public.valves (property_id);

-- Controllers
create table public.controllers (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  label text not null,
  geometry jsonb not null,
  station_count int not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index controllers_property_id_idx on public.controllers (property_id);

-- Controller station to zone mapping
create table public.zone_stations (
  id uuid primary key default gen_random_uuid(),
  controller_id uuid not null references public.controllers (id) on delete cascade,
  station_number int not null check (station_number > 0),
  zone_id uuid not null references public.zones (id) on delete cascade,
  unique (controller_id, station_number)
);

create index zone_stations_controller_id_idx on public.zone_stations (controller_id);

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger properties_updated_at before update on public.properties
  for each row execute procedure public.set_updated_at();
create trigger zones_updated_at before update on public.zones
  for each row execute procedure public.set_updated_at();
create trigger valves_updated_at before update on public.valves
  for each row execute procedure public.set_updated_at();
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
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Public can view profiles of published properties"
  on public.profiles for select
  using (
    exists (
      select 1 from public.properties p
      where p.user_id = profiles.id and p.is_public = true
    )
  );

-- Properties policies
create policy "Users can manage own properties"
  on public.properties for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public can view published properties"
  on public.properties for select
  using (is_public = true);

-- Zones policies
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

create policy "Public can view zones of published properties"
  on public.zones for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = zones.property_id and p.is_public = true
    )
  );

-- Valves policies
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

create policy "Public can view valves of published properties"
  on public.valves for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = valves.property_id and p.is_public = true
    )
  );

-- Controllers policies
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

create policy "Public can view controllers of published properties"
  on public.controllers for select
  using (
    exists (
      select 1 from public.properties p
      where p.id = controllers.property_id and p.is_public = true
    )
  );

-- Zone stations policies
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

create policy "Public can view zone stations of published properties"
  on public.zone_stations for select
  using (
    exists (
      select 1 from public.controllers c
      join public.properties p on p.id = c.property_id
      where c.id = zone_stations.controller_id and p.is_public = true
    )
  );
