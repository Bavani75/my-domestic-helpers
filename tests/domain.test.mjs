import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const source = ts.transpileModule(
  fs.readFileSync(new URL("../lib/domain.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const { localDate, isDue, lastSevenDays, weeklyRanking } = await import(
  "data:text/javascript;base64," + Buffer.from(source).toString("base64")
);
test("Malaysia date rolls over at 16:00 UTC", () => {
  assert.equal(localDate(new Date("2026-09-30T15:59:59Z")), "2026-09-30");
  assert.equal(localDate(new Date("2026-09-30T16:00:00Z")), "2026-10-01");
});
test("weekly duties appear only on their weekday and paused duties never appear", () => {
  assert.equal(
    isDue(
      { active: true, frequency: "weekly", day_of_week: "Wednesday" },
      "2026-09-30",
    ),
    true,
  );
  assert.equal(
    isDue(
      { active: true, frequency: "weekly", day_of_week: "Monday" },
      "2026-09-30",
    ),
    false,
  );
  assert.equal(
    isDue({ active: false, frequency: "daily" }, "2026-09-30"),
    false,
  );
  assert.equal(
    isDue(
      { active: true, frequency: "weekly", day_of_week: null },
      "2026-09-30",
    ),
    false,
  );
});
test("seven-day view crosses month boundaries correctly", () => {
  assert.deepEqual(lastSevenDays("2026-10-03"), [
    "2026-10-03",
    "2026-10-02",
    "2026-10-01",
    "2026-09-30",
    "2026-09-29",
    "2026-09-28",
    "2026-09-27",
  ]);
});
test("ranking counts due dates only, ignores skipped and unrelated logs", () => {
  const data = {
    today: "2026-09-30",
    helpers: [{ id: "h", name: "A" }],
    schedules: [
      {
        id: "s",
        assigned_helper_id: "h",
        active: true,
        frequency: "daily",
        created_at: "2026-09-29T00:00:00Z",
      },
    ],
    logs: [
      {
        duty_schedule_id: "s",
        helper_id: "h",
        log_date: "2026-09-29",
        status: "done",
      },
      {
        duty_schedule_id: "s",
        helper_id: "h",
        log_date: "2026-09-30",
        status: "skipped",
      },
      {
        duty_schedule_id: "other",
        helper_id: "h",
        log_date: "2026-09-30",
        status: "done",
      },
    ],
  };
  const rank = weeklyRanking(data)[0];
  assert.equal(rank.total, 2);
  assert.equal(rank.done, 1);
  assert.equal(rank.rate, 50);
});
