# Agentic Layer

## Risk Levels
- **Low (auto):** Tag maintenance request priority from text; summarize weekly duty completion into a report; score helper performance.
- **Medium (light approval):** Draft a re-assign of overdue duty to another helper; draft maintenance request escalation message.
- **High (always approval):** Send reminder SMS to helper; mark a duty as skipped on behalf of helper.
- **Critical (human-only):** Delete a duty log; delete a helper record.

## Draftable Actions (later)
- Generate weekly performance summary (draft, supervisor reviews)
- Suggest reassignment for overdue duties (draft → approve → execute)

## Executable After Approval (later)
- Send reminder to helper for pending duty
- Escalate stale maintenance request to supervisor

## Named Tools (later)
- `send_helper_reminder` — sends SMS via provider
- `create_duty_log` — logs a duty on behalf (medium risk)
- `update_maintenance_status` — changes status (medium)

No raw run-any / send-any tools. Each action is a named, scoped tool.

## Audit Log Fields
| field | type |
|-------|------|
| id | uuid |
| action | text |
| actor | text |
| target_type | text |
| target_id | uuid |
| risk_level | text |
| approved_by | text nullable |
| created_at | timestamptz |

## v1 vs Later
- v1: No agentic actions. All actions are manual human-triggered.
- Later: Low-risk auto-tagging, medium-risk drafts with approval, audit-logged.
