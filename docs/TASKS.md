# Tasks

## Sprint 1 — DB + Core Engine
**Goal:** App works end-to-end for the key scenario, no login.
- [ ] Create Supabase tables (helpers, duty_schedules, duty_logs, maintenance_requests) + seed data
- [ ] `lib/data/` CRUD functions for all tables
- [ ] Helpers list page (read + add + edit + delete)
- [ ] Schedules page (CRUD duty schedules, assign helper)
- [ ] Today's Duties page: shows today's schedule, "Done" button → inserts duty_log, optional photo upload to Supabase Storage
- [ ] Maintenance page: create request, assign, update status, mark done
- [ ] Dashboard: today's completion %, open maintenance requests, helpers ranked by completion
- [ ] Responsive sidebar shell (desktop) / hamburger (mobile)
- [ ] Handle loading, empty, error states on every page

**DoD:** A helper marks all today's duties done and a maintenance request flows reported→done — all persisted, dashboard reflects it.

**← v1 FUNCTIONAL MILESTONE**

## Sprint 2 — Polish + Robustness
**Goal:** Production-quality interactions.
- [ ] Confirm delete modals
- [ ] Photo preview before upload
- [ ] Empty-state copy on every list ("No duties scheduled for today")
- [ ] Error toasts on failed writes
- [ ] Weekly view of duty logs (past 7 days)
- [ ] Maintenance request detail page with status timeline
- [ ] Mobile button sizes ≥ 48px

**DoD:** No dead buttons, every action shows feedback, mobile-usable.

## Sprint 3 — Lock It Down (auth + RLS)
**Goal:** Per-user data isolation before real use.
- [ ] Supabase Auth (email + phone OTP)
- [ ] Login / signup pages
- [ ] Replace permissive RLS with `auth.uid() = user_id` policies
- [ ] Supervisor role: can read/write all rows
- [ ] Helper role: scoped to own logs + assigned schedules
- [ ] Redirect anonymous users to /login (login wall now active)

**DoD:** Logged-in helper sees only their data; supervisor sees all; anonymous cannot access app.

## Sprint 4 — Intelligence + Agentic (later)
- [ ] AI photo verification of duty completion (store ai_verified, ai_confidence, ai_source)
- [ ] Auto-tag maintenance priority from description
- [ ] Weekly performance summary draft (supervisor approves)
- [ ] Overdue duty alerts
- [ ] Audit log table + logging on every meaningful action

## Gantt
```
S1 ████████████  DB + Core Engine (v1 functional)
S2 ████          Polish + Robustness
S3 ████          Lock It Down
S4 ██████        Intelligence + Agentic (later)
```
