# Household — Chairman House

A mobile-first duty checklist and maintenance tracker built with Next.js and Supabase.

## Run

Use Node.js 22+ and pnpm:

    pnpm install
    vercel link --project my-domestic-helpers
    vercel env pull .env.local
    pnpm verify:db
    pnpm dev

Use the existing Vercel/Supabase project. Never commit .env.local. The app deliberately
has no login wall in v1 and is a shared demo; use sample information until the later
authentication and RLS sprint.

## Database

Check the live tables before applying any SQL. supabase/migrations/0001_init.sql
contains the original schema and seed data and must not be replayed on an existing
database. Apply 0002_workflow.sql once to add signed photo storage, append-only
audit logging, and a weekday for the incomplete AC-filter seed. It preserves existing
data. Database access lives in lib/data; all app writes use server actions.

The weekly AC task appears only on its configured weekday. To demonstrate the exact
five-duty PRD scenario on another day, edit its weekday in Schedules.

## Checks

    pnpm test
    pnpm lint
    pnpm typecheck
    pnpm build

See docs/TEST_PLAN.md for the live five-duty and maintenance acceptance scenario,
and docs/BUILD_STATUS.md for verified results and remaining provisioning work.

## Deploy

Commit and push to main. Vercel must be linked to this GitHub repository.
Do not deploy local files with the Vercel deployment CLI.

Dates and completion counts use Asia/Kuala_Lumpur. Open dashboards refresh every
15 seconds. Weekly ranking uses the current schedule and assignment, excludes dates
before schedule creation, and counts only completed due occurrences.
