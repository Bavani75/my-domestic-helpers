# Build status

## Sprint 1 implementation

Implemented the live Supabase data layer, server-side writes, helper and schedule CRUD,
daily duty logging, signed photo uploads, maintenance progression, dashboard counts,
mobile navigation, and loading/error/empty states. The home route is the working app.
No mock data fallback is used.

The original migration remains unchanged. `0002_workflow.sql` adds photo storage,
append-only audit records through database triggers, and repairs the weekly seed's
missing weekday. Apply it once after checking whether `0001_init.sql` already exists.

## Verification and access

- Production build, ESLint, and TypeScript checks passed.
- Four domain tests pass (Malaysia midnight, weekly scheduling, seven-day dates, completion ranking).
- Live database scenario and migration application are pending Vercel credentials.
- Vercel CLI reported no existing credentials; device sign-in has been requested.
- No environment keys have been invented or committed.
- Sprint 3 authentication and Sprint 4 AI are explicitly later scope in the PRD.

Do not describe the app as end-to-end verified until the live database, storage,
five-duty completion, maintenance lifecycle, and Git-triggered deployment checks pass.

## Sprint 2 implementation

Added photo preview/removal, keyboard-accessible edit dialogs, delete confirmation,
seven-day history, team completion ranking, maintenance detail and audit timeline,
concurrency protection for status updates, and completion of existing pending logs.
Server-side photo URLs are restricted to this project's storage bucket.

Sprint 1 was pushed as `1b9264c`. GitHub's public commit checks, statuses, and
deployment APIs returned no deployment records during verification. A push is
confirmed; a successful Vercel deployment is not yet confirmed.

`vercel env pull .env.local` was attempted and failed with "No existing credentials
found". Migration 0002 has been written but has NOT been applied. The initial
migration's live state is also unverified. Once Vercel access is restored, link the
existing project, pull its environment, run `pnpm verify:db`, apply only missing
migrations through the existing Supabase project, then run the PRD success scenario.
