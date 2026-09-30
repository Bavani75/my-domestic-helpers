# Data Model

## helpers
| field | type | notes |
|-------|------|-------|
| id | uuid | pk |
| name | text | not null |
| role | text | e.g. cleaner, maintenance |
| phone | text | nullable |
| photo_url | text | nullable |
| user_id | uuid | nullable (lock-down) |
| created_at | timestamptz | default now() |

## duty_schedules
| field | type | notes |
|-------|------|-------|
| id | uuid | pk |
| title | text | e.g. "Clean kitchen" |
| description | text | nullable |
| frequency | text | daily / weekly |
| day_of_week | text | nullable (for weekly) |
| assigned_helper_id | uuid | fk helpers, nullable |
| active | boolean | default true |
| user_id | uuid | nullable |
| created_at | timestamptz | default now() |

## duty_logs
| field | type | notes |
|-------|------|-------|
| id | uuid | pk |
| duty_schedule_id | uuid | fk duty_schedules |
| helper_id | uuid | fk helpers, nullable |
| log_date | date | the duty date |
| status | text | done / skipped / pending |
| photo_url | text | nullable |
| note | text | nullable |
| ai_verified | boolean | nullable (later) |
| ai_confidence | numeric | nullable (later) |
| ai_source | text | nullable (later) |
| review_status | text | default 'unreviewed' |
| user_id | uuid | nullable |
| created_at | timestamptz | default now() |

## maintenance_requests
| field | type | notes |
|-------|------|-------|
| id | uuid | pk |
| title | text | e.g. "Broken lobby light" |
| description | text | nullable |
| location | text | e.g. "Lobby" |
| priority | text | low / medium / high |
| status | text | reported / assigned / in-progress / done |
| assigned_helper_id | uuid | fk helpers, nullable |
| photo_url | text | nullable |
| resolved_at | timestamptz | nullable |
| user_id | uuid | nullable |
| created_at | timestamptz | default now() |

## Relationships
- duty_schedules.assigned_helper_id → helpers.id
- duty_logs.duty_schedule_id → duty_schedules.id
- duty_logs.helper_id → helpers.id
- maintenance_requests.assigned_helper_id → helpers.id

## RLS (v1)
All tables: permissive read/write for demo. Lock-down sprint replaces with `auth.uid() = user_id`.
