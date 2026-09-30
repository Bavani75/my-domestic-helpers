export type Helper = { id: string; name: string; role: string | null; phone: string | null; photo_url: string | null; created_at: string };
export type Schedule = { id: string; title: string; description: string | null; frequency: string; day_of_week: string | null; assigned_helper_id: string | null; active: boolean; created_at: string };
export type Log = { id: string; duty_schedule_id: string; helper_id: string | null; log_date: string; status: string; note: string | null; photo_url: string | null; created_at: string };
export type Request = { id: string; title: string; description: string | null; location: string | null; priority: string; status: string; assigned_helper_id: string | null; photo_url: string | null; resolved_at: string | null; created_at: string };
export type Snapshot = { helpers: Helper[]; schedules: Schedule[]; logs: Log[]; requests: Request[]; today: string };
export const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function localDate(date = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date); }
export function isDue(s: Schedule, date: string) { return s.active && (s.frequency === 'daily' || s.day_of_week === weekdays[new Date(date + 'T12:00:00+08:00').getUTCDay()]); }
export function timestamp(value: string) { return new Intl.DateTimeFormat('en-MY', { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
