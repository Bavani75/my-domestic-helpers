# Architecture

## Stack
Next.js (App Router) + Supabase (Postgres + Storage) + Vercel deploy.

## Build Now (v1)
- Helpers, duty schedules, daily duty logs, maintenance requests, dashboard
- All viewable without login; seeded demo data

## Build Later
- Auth + per-user RLS (lock-down sprint)
- AI photo verification of duty completion
- Recurring auto-generation of daily duty logs
- Notifications / reminders

## Key User Action Flow (Duty Log)
1. Helper opens app → dashboard loads today's scheduled duties
2. Each duty row has a "Done" button + optional photo upload
3. Tap done → `duty_logs` row inserted (duty_id, helper_id, logged_at, photo_url)
4. Dashboard completion % recalculates from logs vs schedule
5. Supervisor sees updated count live

## Responsive Nav Shell
Persistent left sidebar on desktop (Helpers, Schedules, Today's Duties, Maintenance, Dashboard). Collapses to hamburger menu on mobile — primary device for helpers.

## Layer Plan
1. **Data** — Supabase tables, RLS permissive for demo, seed rows
2. **Data-access** — `lib/data/` functions for all reads/writes
3. **App logic** — server actions for logging duties, updating maintenance status
4. **UI** — route pages consuming data-access layer only
5. **Smart (later)** — AI photo verification module, separate `lib/ai/`

## Core Without AI
Duty logging, maintenance workflow, dashboard all run with pure DB CRUD. AI photo verification is additive later — core engine needs no AI to function.

## Repo Structure
```
app/
  helpers/
  schedules/
  today/
  maintenance/
  dashboard/
components/
lib/
  data/          # all DB access
  actions/       # server actions
  ai/            # later
tests/
```

## Module Map
| Module | Responsibility | Data owned | Build order |
|--------|--------------|------------|-------------|
| helpers | CRUD helpers | `helpers` | 1 |
| schedules | CRUD duty schedules | `duty_schedules` | 2 |
| duty-logs | log + list today's duties | `duty_logs` | 3 (core engine) |
| maintenance | request lifecycle | `maintenance_requests` | 4 |
| dashboard | summary view | reads all | 5 |
| auth | login + RLS | `users` memberships | 6 (later) |
