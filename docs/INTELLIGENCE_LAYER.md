# Intelligence Layer

## Messy Inputs
- Helper photo of completed duty (blurry, dark, wrong angle)
- Free-text maintenance description ("light not working in lobby again")
- Quick voice-note-style note on duty log

## Auto-Structure (later, JSON example)
```json
{
  "duty_log_id": "...",
  "ai_verified": true,
  "ai_confidence": 0.82,
  "ai_source": "photo-classifier-v1",
  "evidence": "surface appears clean, no visible debris",
  "review_status": "auto-approved"
}
```

## Events to Track
- duty_logged (status done/skipped)
- duty_overdue (schedule due, no log by end of day)
- maintenance_status_changed
- maintenance_overdue (assigned > 3 days, not done)

## Scoring Rules (rule-based start)
- Helper weekly completion rate = logs_done / logs_expected × 100
- Overdue penalty: −5 pts per overdue duty
- Maintenance response time = avg(resolved_at − created_at)
- Priority weighting: high=×2, medium=×1.5, low=×1

## What Gets Ranked
- Helpers ranked by weekly completion % (dashboard)
- Maintenance requests ranked by priority + age

## v1 vs Later
- v1: rule-based scoring (completion %, open-request count)
- Later: AI photo verification of duty completion, AI auto-tagging of maintenance descriptions, overdue auto-alerts
