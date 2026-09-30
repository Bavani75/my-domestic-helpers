create table if not exists helpers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  phone text,
  photo_url text,
  user_id uuid,
  created_at timestamptz not null default now()
);
alter table helpers enable row level security;
drop policy if exists "helpers_v1_read" on helpers;
create policy "helpers_v1_read" on helpers for select using (true);
drop policy if exists "helpers_v1_write" on helpers;
create policy "helpers_v1_write" on helpers for all using (true) with check (true);

create table if not exists duty_schedules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  frequency text not null default 'daily',
  day_of_week text,
  assigned_helper_id uuid references helpers(id) on delete set null,
  active boolean not null default true,
  user_id uuid,
  created_at timestamptz not null default now()
);
alter table duty_schedules enable row level security;
drop policy if exists "duty_schedules_v1_read" on duty_schedules;
create policy "duty_schedules_v1_read" on duty_schedules for select using (true);
drop policy if exists "duty_schedules_v1_write" on duty_schedules;
create policy "duty_schedules_v1_write" on duty_schedules for all using (true) with check (true);

create table if not exists duty_logs (
  id uuid primary key default gen_random_uuid(),
  duty_schedule_id uuid not null references duty_schedules(id) on delete cascade,
  helper_id uuid references helpers(id) on delete set null,
  log_date date not null default current_date,
  status text not null default 'done',
  photo_url text,
  note text,
  ai_verified boolean,
  ai_confidence numeric,
  ai_source text,
  review_status text not null default 'unreviewed',
  user_id uuid,
  created_at timestamptz not null default now(),
  unique (duty_schedule_id, log_date)
);
alter table duty_logs enable row level security;
drop policy if exists "duty_logs_v1_read" on duty_logs;
create policy "duty_logs_v1_read" on duty_logs for select using (true);
drop policy if exists "duty_logs_v1_write" on duty_logs;
create policy "duty_logs_v1_write" on duty_logs for all using (true) with check (true);

create table if not exists maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  priority text not null default 'medium',
  status text not null default 'reported',
  assigned_helper_id uuid references helpers(id) on delete set null,
  photo_url text,
  resolved_at timestamptz,
  user_id uuid,
  created_at timestamptz not null default now()
);
alter table maintenance_requests enable row level security;
drop policy if exists "maintenance_requests_v1_read" on maintenance_requests;
create policy "maintenance_requests_v1_read" on maintenance_requests for select using (true);
drop policy if exists "maintenance_requests_v1_write" on maintenance_requests;
create policy "maintenance_requests_v1_write" on maintenance_requests for all using (true) with check (true);

insert into helpers (id, name, role, phone)
values
  ('a1111111-1111-1111-1111-111111111111', 'Ramesh', 'Cleaner', '9876543210'),
  ('a2222222-2222-2222-2222-222222222222', 'Sita', 'Cleaner', '9876543211'),
  ('a3333333-3333-3333-3333-333333333333', 'Mohan', 'Maintenance', '9876543212')
on conflict do nothing;

insert into duty_schedules (id, title, description, frequency, assigned_helper_id)
values
  ('b1111111-1111-1111-1111-111111111111', 'Clean kitchen', 'Wipe counters, sweep floor, take out trash', 'daily', 'a1111111-1111-1111-1111-111111111111'),
  ('b2222222-2222-2222-2222-222222222222', 'Sweep and mop lobby', 'Full lobby floor sweep and mop', 'daily', 'a2222222-2222-2222-2222-222222222222'),
  ('b3333333-3333-3333-3333-333333333333', 'Clean bathrooms', 'All bathrooms — toilets, sinks, mirrors, floors', 'daily', 'a1111111-1111-1111-1111-111111111111'),
  ('b4444444-4444-4444-4444-444444444444', 'Check AC filters', 'Inspect and clean AC filters on all floors', 'weekly', 'a3333333-3333-3333-3333-333333333333'),
  ('b5555555-5555-5555-5555-555555555555', 'Water plants', 'All indoor and balcony plants', 'daily', 'a2222222-2222-2222-2222-222222222222')
on conflict do nothing;

insert into duty_logs (duty_schedule_id, helper_id, log_date, status, note)
values
  ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', current_date, 'done', 'Kitchen clean and tidy'),
  ('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', current_date, 'done', 'Lobby mopped')
on conflict do nothing;

insert into maintenance_requests (title, description, location, priority, status, assigned_helper_id)
values
  ('Broken lobby light', 'Ceiling light in main lobby not turning on', 'Lobby', 'high', 'assigned', 'a3333333-3333-3333-3333-333333333333'),
  ('Leaky kitchen tap', 'Kitchen sink tap dripping continuously', 'Kitchen', 'medium', 'reported', null),
  ('AC not cooling in bedroom 2', 'Bedroom 2 AC running but not cooling', 'Bedroom 2', 'high', 'in-progress', 'a3333333-3333-3333-3333-333333333333')
on conflict do nothing;