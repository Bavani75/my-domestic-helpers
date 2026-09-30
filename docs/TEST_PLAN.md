# Test Plan

## v1 Success Scenario
1. Open app (no login) → dashboard loads with seed data, completion % visible
2. Go to Today's Duties → see 5 seeded duties for today
3. Tap "Done" on first duty → button changes to ✓ with timestamp, dashboard completion updates
4. Upload a photo on second duty → photo stored, log saved
5. Go to Maintenance → tap "New Request" → enter "Broken lobby light", priority high → save
6. New request appears with status "reported"
7. Assign to a helper → status → "assigned"
8. Update to "in-progress" → then "done" → resolved_at set
9. Dashboard shows 0 open requests, 2/5 or 5/5 duties done

## Empty States
- Delete all duty schedules → Today's Duties shows "No duties scheduled for today. Add a schedule."
- No maintenance requests → Maintenance page shows "No maintenance requests. Report one to get started."
- No helpers → Helpers page shows "No helpers yet. Add your first helper."

## Error States
- Supabase unreachable → dashboard shows "Couldn't load data. Check connection and retry." with retry button
- Photo upload fails → "Photo upload failed. You can still log the duty without a photo."
- Duplicate duty log for same date → DB unique constraint prevents; UI shows "Already logged for today."

## Mobile Checks
- Hamburger menu opens/closes
- All buttons ≥ 48px tap target
- Forms scroll without cutting off submit button
