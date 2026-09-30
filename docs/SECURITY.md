# Security

## Secret Handling
- Supabase service key: server-side only, never in frontend env vars exposed to client
- Next.js server actions / route handlers for all writes
- Storage bucket for photos: public read, write via signed upload URL from server

## Permission Model (end state — lock-down sprint)
- RLS on every table: `auth.uid() = user_id` for owner-scoped read/write
- Supervisors: membership in a `supervisor` role → can read all rows, write all
- Helpers: can read assigned schedules, create duty_logs for self, update maintenance status for assigned requests

## v1 (demo-first)
- Permissive RLS policies (read/write open) so app renders for anonymous visitors
- No secrets in client bundle; all DB access via `lib/data/` server functions

## Approved Tools Rule
- Only named, scoped tools for agentic actions (later)
- Never raw SQL execution or arbitrary send from agent
- Every agentic action logged to audit_logs

## Audit Principle
- Every meaningful action (duty logged, status changed, request assigned) writes to audit_logs
- Audit log is append-only; no deletion
