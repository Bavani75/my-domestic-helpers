export type Helper = {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  photo_url: string | null;
  created_at: string;
};
export type Schedule = {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  day_of_week: string | null;
  assigned_helper_id: string | null;
  active: boolean;
  created_at: string;
};
export type Log = {
  id: string;
  duty_schedule_id: string;
  helper_id: string | null;
  log_date: string;
  status: string;
  note: string | null;
  photo_url: string | null;
  created_at: string;
};
export type Request = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  priority: string;
  status: string;
  assigned_helper_id: string | null;
  photo_url: string | null;
  resolved_at: string | null;
  created_at: string;
};
export type Snapshot = {
  helpers: Helper[];
  schedules: Schedule[];
  logs: Log[];
  requests: Request[];
  today: string;
};
export type Audit = {
  id: string;
  action: string;
  created_at: string;
  details: { before: Request | null; after: Request | null };
};
export const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export function localDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function isDue(s: Schedule, date: string) {
  return (
    s.active &&
    (s.frequency === "daily" ||
      s.day_of_week ===
        weekdays[new Date(date + "T12:00:00+08:00").getUTCDay()])
  );
}
export function timestamp(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
export function lastSevenDays(today: string) {
  return Array.from({ length: 7 }, (_, i) =>
    new Date(new Date(today + "T12:00:00Z").getTime() - i * 86400000)
      .toISOString()
      .slice(0, 10),
  );
}
export function weeklyRanking(data: Snapshot) {
  const days = lastSevenDays(data.today);
  return data.helpers
    .map((helper) => {
      const schedules = data.schedules.filter(
        (s) => s.assigned_helper_id === helper.id,
      );
      const expected = schedules.flatMap((s) =>
        days
          .filter(
            (day) => isDue(s, day) && day >= localDate(new Date(s.created_at)),
          )
          .map((day) => ({ id: s.id, day })),
      );
      const done = expected.filter((e) =>
        data.logs.some(
          (l) =>
            l.duty_schedule_id === e.id &&
            l.log_date === e.day &&
            l.helper_id === helper.id &&
            l.status === "done",
        ),
      ).length;
      return {
        helper,
        done,
        total: expected.length,
        rate: expected.length ? Math.round((done / expected.length) * 100) : 0,
      };
    })
    .sort(
      (a, b) =>
        b.rate - a.rate ||
        b.done - a.done ||
        a.helper.name.localeCompare(b.helper.name),
    );
}
