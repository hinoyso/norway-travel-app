-- ============================================================
-- Norway Travel App — Supabase Database Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TRIPS
-- ============================================================
create table if not exists public.trips (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  destination text not null default 'Norway',
  start_date  date not null,
  end_date    date not null,
  cover_image_url text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- TRIP DAYS
-- ============================================================
create table if not exists public.trip_days (
  id         uuid primary key default uuid_generate_v4(),
  trip_id    uuid not null references public.trips(id) on delete cascade,
  day_number integer not null,
  date       date not null,
  city       text not null,
  notes      text,
  created_at timestamptz not null default now(),
  unique (trip_id, day_number)
);

-- ============================================================
-- ACTIVITIES
-- ============================================================
create table if not exists public.activities (
  id          uuid primary key default uuid_generate_v4(),
  trip_id     uuid not null references public.trips(id) on delete cascade,
  day_id      uuid not null references public.trip_days(id) on delete cascade,
  name        text not null,
  description text,
  start_time  time,
  end_time    time,
  address     text,
  latitude    double precision,
  longitude   double precision,
  notes       text,
  order_index integer not null default 0,
  category    text check (category in (
    'sightseeing','food','transport','accommodation',
    'outdoor','culture','shopping','other'
  )) default 'other',
  created_at  timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_trips_user_id       on public.trips(user_id);
create index if not exists idx_trip_days_trip_id   on public.trip_days(trip_id);
create index if not exists idx_trip_days_date      on public.trip_days(date);
create index if not exists idx_activities_day_id   on public.activities(day_id);
create index if not exists idx_activities_trip_id  on public.activities(trip_id);
create index if not exists idx_activities_order    on public.activities(day_id, order_index);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.trips      enable row level security;
alter table public.trip_days  enable row level security;
alter table public.activities enable row level security;

-- Trips: users can only see their own
create policy "trips_select" on public.trips
  for select using (auth.uid() = user_id);

create policy "trips_insert" on public.trips
  for insert with check (auth.uid() = user_id);

create policy "trips_update" on public.trips
  for update using (auth.uid() = user_id);

create policy "trips_delete" on public.trips
  for delete using (auth.uid() = user_id);

-- Trip days: access through trip ownership
create policy "trip_days_select" on public.trip_days
  for select using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

create policy "trip_days_insert" on public.trip_days
  for insert with check (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

create policy "trip_days_delete" on public.trip_days
  for delete using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

-- Activities: access through trip ownership
create policy "activities_select" on public.activities
  for select using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

create policy "activities_insert" on public.activities
  for insert with check (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

create policy "activities_delete" on public.activities
  for delete using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trips_updated_at
  before update on public.trips
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- HELPER: get trip with day count
-- ============================================================
create or replace view public.trips_with_stats as
select
  t.*,
  count(distinct td.id) as day_count,
  count(distinct a.id)  as activity_count
from public.trips t
left join public.trip_days td on td.trip_id = t.id
left join public.activities a on a.trip_id = t.id
group by t.id;
