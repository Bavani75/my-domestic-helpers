# Domestic Helpers Duty Tracker

## Problem
Chairman House domestic helpers must complete daily duties (cleanliness, maintenance) per schedule. Printed forms are lost, unreadable, and hard to monitor. We need a simple digital system helpers actually use, with minimum supervision.

## Target User
Domestic helpers at home — low tech literacy, mobile-first, need big buttons and simple language. A supervisor/owner reviews remotely.

## Core Objects
- **Helpers** — name, role, phone, photo
- **Duty Schedules** — recurring tasks (clean kitchen, sweep lobby, check AC filters) with frequency (daily/weekly), assigned helper
- **Duty Logs** — a helper marking a scheduled duty done on a given date, with optional photo
- **Maintenance Requests** — a maintenance issue (leaky tap, broken light) with status: reported → assigned → in-progress → done

## MVP (v1) — must-haves
- [ ] Helpers list (seeded, editable)
- [ ] Duty schedules CRUD
- [ ] Daily duty checklist for today (helper taps done → saves log with timestamp)
- [ ] Maintenance request workflow: create → assign → update status → mark done
- [ ] Simple dashboard: today's completion %, open maintenance requests
- [ ] Works on mobile, no login wall (demo-first)

## Non-goals (v1)
- Authentication / per-user data isolation (later sprint)
- Payroll or attendance
- AI auto-scoring of photo evidence
- Multi-property support

## Success Criteria
A helper opens the app on their phone, sees today's 5 duties, taps each as done (photo optional), and the supervisor's dashboard shows 5/5 complete with timestamps. A maintenance issue (broken lobby light) is reported, assigned, updated to in-progress, and marked done — all within the app, replacing a printed form.
