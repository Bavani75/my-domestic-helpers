"use client";
import Link from "next/link";
import Image from "next/image";
import Dialog from "./dialog";
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type FormEvent,
} from "react";
import { loadData, mutate, photoUpload } from "@/lib/actions";
import {
  isDue,
  timestamp,
  weekdays,
  weeklyRanking,
  type Snapshot,
  type Helper,
  type Schedule,
  type Request,
} from "@/lib/domain";

const nav = [
  ["dashboard", "Overview", "◫"],
  ["today", "Today’s duties", "✓"],
  ["helpers", "Helpers", "♧"],
  ["schedules", "Schedules", "▦"],
  ["maintenance", "Maintenance", "⚒"],
  ["history", "Duty history", "◷"],
];
type Editable = Partial<Helper & Schedule & Request>;
type Editor = { kind: string; record: Editable };
export default function Tracker({
  section = "dashboard",
}: {
  section?: string;
}) {
  const [data, setData] = useState<Snapshot>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [editor, setEditor] = useState<Editor>();
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");
  const reload = useCallback(async () => {
    try {
      setData(await loadData());
      setError("");
    } catch {
      setError("Couldn't load data. Check connection and retry.");
    }
  }, []);
  useEffect(() => {
    void reload();
    const timer = setInterval(() => void reload(), 15000);
    return () => clearInterval(timer);
  }, [reload]);
  async function submit(form: FormData) {
    setBusy(true);
    setNotice("");
    try {
      const result = await mutate(form);
      setNotice(result.message);
      if (result.ok) {
        setEditor(undefined);
        await reload();
      }
      return result.ok;
    } catch {
      setNotice("Connection interrupted. Please retry.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function deleteRecord(kind: string, id: string) {
    if (
      !confirm(
        kind === "schedule"
          ? "Delete this schedule and its duty history? This cannot be undone."
          : "Delete this record? This cannot be undone.",
      )
    )
      return;
    const f = new FormData();
    f.set("kind", kind);
    f.set("id", id);
    f.set("operation", "delete");
    await submit(f);
  }
  const helperName = (id: string | null | undefined) =>
    data?.helpers.find((h) => h.id === id)?.name || "Unassigned";
  const due = data?.schedules.filter((s) => isDue(s, data.today)) || [];
  const completed = due.filter((s) =>
    data?.logs.some(
      (l) =>
        l.duty_schedule_id === s.id &&
        l.log_date === data.today &&
        l.status === "done",
    ),
  );
  const percent = due.length
    ? Math.round((completed.length / due.length) * 100)
    : 0;
  const open = data?.requests.filter((r) => r.status !== "done") || [];
  const label = nav.find((n) => n[0] === section)?.[1];
  return (
    <div className="app-shell">
      <aside className={menu ? "sidebar visible" : "sidebar"}>
        <Link href="/" className="brand">
          <span className="brand-mark">⌂</span>
          <span>
            Household<span className="brand-sub">CHAIRMAN HOUSE</span>
          </span>
        </Link>
        <p className="nav-label">YOUR WORKSPACE</p>
        <nav>
          {nav.map(([href, title, icon]) => (
            <Link
              className={section === href ? "nav-item selected" : "nav-item"}
              href={"/" + href}
              key={href}
              onClick={() => setMenu(false)}
            >
              <span>{icon}</span>
              {title}
              {href === "maintenance" && open.length > 0 && (
                <b>{open.length}</b>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="avatar">CH</span>
          <div>
            Chairman House<small>Household workspace</small>
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <button
            className="menu-button secondary"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <span>
            Household <span className="slash">/</span> {label}
          </span>
          <span className="demo-label">● Shared demo</span>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">A LITTLE CARE, EVERY DAY</div>
              <h1>
                {section === "dashboard" ? "A home, well cared for." : label}
              </h1>
              <p>
                {section === "dashboard"
                  ? "Your household at a glance. Every duty, every detail."
                  : section === "today"
                    ? "One task at a time. Let’s make today a good day."
                    : section === "maintenance"
                      ? "Report a problem. Keep every repair moving."
                      : section === "helpers"
                        ? "The people who keep everything running."
                        : section === "schedules"
                          ? "Simple routines for a smoothly running home."
                          : "A record of the care that goes into your home."}
              </p>
            </div>
            <span className="date-chip">
              {data
                ? new Date(data.today + "T12:00:00").toLocaleDateString(
                    "en-MY",
                    { weekday: "short", day: "numeric", month: "long" },
                  )
                : "Today"}
              <small>Malaysia time</small>
            </span>
          </div>
          {notice && (
            <div role="status" className="notice">
              {notice}
              <button
                className="secondary"
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )}
          {error && (
            <div role="alert" className="error">
              {error}
              <button onClick={() => void reload()}>Retry</button>
            </div>
          )}
          {!data && !error && (
            <div className="empty">Loading your household…</div>
          )}
          {data && (
            <>
              {(section === "dashboard" || section === "today") && (
                <div className="stats">
                  <article className="stat">
                    <span>Today’s completion</span>
                    <strong>
                      {percent}
                      <small>%</small>
                    </strong>
                    <div className="progress">
                      <i style={{ width: percent + "%" }} />
                    </div>
                    <p>
                      {completed.length} of {due.length} duties complete
                    </p>
                  </article>
                  <article className="stat">
                    <span>Duties remaining</span>
                    <strong>
                      {due.length - completed.length}
                      <small> duties</small>
                    </strong>
                    <p>
                      {due.length === completed.length
                        ? "All caught up. Nicely done."
                        : "A little progress goes a long way."}
                    </p>
                  </article>
                  <article className="stat">
                    <span>Open maintenance</span>
                    <strong>
                      {open.length}
                      <small> requests</small>
                    </strong>
                    <p>
                      {open.filter((r) => r.priority === "high").length} high
                      priority <Link href="/maintenance">View requests →</Link>
                    </p>
                  </article>
                </div>
              )}
              {(section === "dashboard" || section === "today") && (
                <div className={section === "dashboard" ? "overview-grid" : ""}>
                  <section className="panel">
                    <div className="panel-heading">
                      <div>
                        <h2>
                          Today’s checklist{" "}
                          <span className="count">{due.length}</span>
                        </h2>
                        <p>Small tasks. A happier home.</p>
                      </div>
                      <select
                        aria-label="Filter by helper"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="">All helpers</option>
                        {data.helpers.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {due.length === 0 ? (
                      <Empty
                        text="No duties scheduled for today. Add a schedule."
                        href="/schedules"
                      />
                    ) : (
                      due
                        .filter(
                          (s) => !filter || s.assigned_helper_id === filter,
                        )
                        .map((s) => (
                          <Duty
                            key={s.id}
                            schedule={s}
                            name={helperName(s.assigned_helper_id)}
                            log={data.logs.find(
                              (l) =>
                                l.duty_schedule_id === s.id &&
                                l.log_date === data.today,
                            )}
                            busy={busy}
                            submit={submit}
                          />
                        ))
                    )}
                    {filter &&
                      !due.some((s) => s.assigned_helper_id === filter) && (
                        <Empty text="No duties for this helper today." />
                      )}
                    <div className="panel-footer">
                      Changes refresh automatically every 15 seconds.
                    </div>
                  </section>
                  {section === "dashboard" && (
                    <div>
                      <section className="panel">
                        <div className="panel-heading">
                          <h2>Needs attention</h2>
                          <Link href="/maintenance">View all →</Link>
                        </div>
                        {open.length === 0 ? (
                          <Empty text="All clear. No open maintenance requests." />
                        ) : (
                          open
                            .slice()
                            .sort(
                              (a, b) =>
                                ({ high: 0, medium: 1, low: 2 })[a.priority]! -
                                { high: 0, medium: 1, low: 2 }[b.priority]!,
                            )
                            .slice(0, 3)
                            .map((r) => (
                              <Link
                                href="/maintenance"
                                className="attention"
                                key={r.id}
                              >
                                <span className={"badge " + r.priority}>
                                  {r.priority}
                                </span>
                                <h3>{r.title}</h3>
                                <p>
                                  {r.location || "Location not provided"} ·{" "}
                                  {r.status}
                                </p>
                              </Link>
                            ))
                        )}
                      </section>
                      <section
                        className="panel team"
                        title="Past seven days, based on current schedules and assignments"
                      >
                        <div className="panel-heading">
                          <h2>This week’s team</h2>
                          <Link href="/helpers">Manage →</Link>
                        </div>
                        {weeklyRanking(data).map(
                          ({ helper: h, done, total, rate }) => {
                            return (
                              <div className="team-row" key={h.id}>
                                <span className="avatar">
                                  {h.name.slice(0, 1)}
                                </span>
                                <div>
                                  <strong>{h.name}</strong>
                                  <small>{h.role || "Helper"}</small>
                                </div>
                                <span>
                                  {done}/{total} · {rate}%
                                </span>
                              </div>
                            );
                          },
                        )}
                      </section>
                    </div>
                  )}
                </div>
              )}
              {section === "helpers" && (
                <section className="panel">
                  <div className="panel-heading">
                    <h2>
                      Your helpers{" "}
                      <span className="count">{data.helpers.length}</span>
                    </h2>
                    <button
                      onClick={() => setEditor({ kind: "helper", record: {} })}
                    >
                      + Add helper
                    </button>
                  </div>
                  {!data.helpers.length && (
                    <Empty text="No helpers yet. Add your first helper." />
                  )}
                  <div className="cards">
                    {data.helpers.map((h) => (
                      <article className="record-card" key={h.id}>
                        <span className="avatar large">
                          {h.name.slice(0, 1)}
                        </span>
                        <h2>{h.name}</h2>
                        <p>{h.role || "Helper"}</p>
                        <p>{h.phone || "No phone added"}</p>
                        <div className="actions">
                          <button
                            className="secondary"
                            onClick={() =>
                              setEditor({ kind: "helper", record: h })
                            }
                          >
                            Edit helper
                          </button>
                          <button
                            disabled={busy}
                            className="danger"
                            onClick={() => deleteRecord("helper", h.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
              {section === "schedules" && (
                <section className="panel">
                  <div className="panel-heading">
                    <h2>Household routines</h2>
                    <button
                      onClick={() =>
                        setEditor({
                          kind: "schedule",
                          record: { active: true, frequency: "daily" },
                        })
                      }
                    >
                      + Add schedule
                    </button>
                  </div>
                  {!data.schedules.length && (
                    <Empty text="No schedules yet. Add your first duty." />
                  )}
                  {data.schedules.map((s) => (
                    <div className="schedule-row" key={s.id}>
                      <div>
                        <h3>
                          {s.title}{" "}
                          {!s.active && <span className="badge">Paused</span>}
                        </h3>
                        <p>{s.description}</p>
                        <small>
                          {s.frequency === "weekly"
                            ? `Every ${s.day_of_week || "weekday not set"}`
                            : "Every day"}{" "}
                          · {helperName(s.assigned_helper_id)}
                        </small>
                      </div>
                      <div className="actions">
                        <button
                          className="secondary"
                          onClick={() =>
                            setEditor({ kind: "schedule", record: s })
                          }
                        >
                          Edit
                        </button>
                        <button
                          disabled={busy}
                          className="danger"
                          onClick={() => deleteRecord("schedule", s.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              )}
              {section === "maintenance" && (
                <section className="panel">
                  <div className="panel-heading">
                    <h2>Maintenance requests</h2>
                    <button
                      onClick={() =>
                        setEditor({
                          kind: "request",
                          record: { priority: "medium", status: "reported" },
                        })
                      }
                    >
                      + New request
                    </button>
                  </div>
                  <div className="filters">
                    {["open", "all", "done"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={statusFilter === s ? "" : "secondary"}
                      >
                        {s === "open"
                          ? "Open requests"
                          : s === "all"
                            ? "All requests"
                            : "Completed"}
                      </button>
                    ))}
                  </div>
                  {!data.requests.filter(
                    (r) =>
                      statusFilter === "all" ||
                      (statusFilter === "done"
                        ? r.status === "done"
                        : r.status !== "done"),
                  ).length && (
                    <Empty text="No maintenance requests. Report one to get started." />
                  )}
                  <div className="cards">
                    {data.requests
                      .filter(
                        (r) =>
                          statusFilter === "all" ||
                          (statusFilter === "done"
                            ? r.status === "done"
                            : r.status !== "done"),
                      )
                      .sort(
                        (a, b) =>
                          ({ high: 0, medium: 1, low: 2 })[a.priority]! -
                            { high: 0, medium: 1, low: 2 }[b.priority]! ||
                          a.created_at.localeCompare(b.created_at),
                      )
                      .map((r) => (
                        <article className="record-card" key={r.id}>
                          <div className="card-top">
                            <span className={"badge " + r.priority}>
                              {r.priority} priority
                            </span>
                            <span className="badge">{r.status}</span>
                          </div>
                          <h2>
                            <Link href={"/maintenance/" + r.id}>
                              {r.title} ↗
                            </Link>
                          </h2>
                          <p>{r.description}</p>
                          <p>
                            {r.location || "No location"} ·{" "}
                            {helperName(r.assigned_helper_id)}
                          </p>
                          <small>Reported {timestamp(r.created_at)}</small>
                          {r.resolved_at && (
                            <small>Completed {timestamp(r.resolved_at)}</small>
                          )}
                          <div className="actions">
                            <button
                              className="secondary"
                              onClick={() =>
                                setEditor({ kind: "request", record: r })
                              }
                            >
                              Manage request
                            </button>
                            <button
                              disabled={busy}
                              className="danger"
                              onClick={() => deleteRecord("request", r.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                </section>
              )}
              {section === "history" && (
                <section className="panel">
                  <div className="panel-heading">
                    <h2>Past 7 days</h2>
                    <span>Completed duties</span>
                  </div>
                  {data.logs
                    .filter(
                      (l) =>
                        l.log_date >=
                          new Date(
                            new Date(data.today + "T12:00:00Z").getTime() -
                              6 * 86400000,
                          )
                            .toISOString()
                            .slice(0, 10) && l.log_date <= data.today,
                    )
                    .map((l) => (
                      <div className="schedule-row" key={l.id}>
                        <div>
                          <h3>
                            {data.schedules.find(
                              (s) => s.id === l.duty_schedule_id,
                            )?.title || "Deleted schedule"}
                          </h3>
                          <p>
                            {helperName(l.helper_id)} · {l.log_date} ·{" "}
                            {l.status}
                          </p>
                          <small>{timestamp(l.created_at)}</small>
                          {l.note && <p>{l.note}</p>}
                          {l.photo_url && (
                            <a
                              href={l.photo_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View photo ↗
                            </a>
                          )}
                        </div>
                        <button
                          className="danger"
                          disabled={busy}
                          onClick={() => deleteRecord("log", l.id)}
                        >
                          Delete log
                        </button>
                      </div>
                    ))}
                  {!data.logs.some(
                    (l) =>
                      l.log_date >=
                      new Date(
                        new Date(data.today + "T12:00:00Z").getTime() -
                          6 * 86400000,
                      )
                        .toISOString()
                        .slice(0, 10),
                  ) && (
                    <Empty text="No duty logs in the past 7 days. Complete a duty to start your history." />
                  )}
                </section>
              )}
            </>
          )}
          <footer className="page-footer">
            Made for the everyday care of Chairman House{" "}
            <span>Shared demo · Use sample information only</span>
          </footer>
        </main>
      </div>
      {editor && data && (
        <Dialog onClose={() => setEditor(undefined)}>
          <div className="panel-heading">
            <h2 id="editor-title">
              {editor.record.id ? "Edit" : "New"} {editor.kind}
            </h2>
            <button
              className="secondary"
              aria-label="Close editor"
              onClick={() => setEditor(undefined)}
            >
              ×
            </button>
          </div>
          <form
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              await submit(new FormData(e.currentTarget));
            }}
          >
            <input type="hidden" name="kind" value={editor.kind} />
            <input type="hidden" name="id" value={editor.record.id || ""} />
            {editor.kind === "helper" ? (
              <>
                <Field
                  name="name"
                  title="Name"
                  value={editor.record.name}
                  required
                />
                <Field name="role" title="Role" value={editor.record.role} />
                <Field name="phone" title="Phone" value={editor.record.phone} />
              </>
            ) : (
              <>
                <Field
                  name="title"
                  title="Title"
                  value={editor.record.title}
                  required
                />
                <label>
                  Description
                  <textarea
                    name="description"
                    defaultValue={editor.record.description || ""}
                    maxLength={3000}
                  />
                </label>
                <label>
                  Assigned helper
                  <select
                    name="assigned_helper_id"
                    defaultValue={editor.record.assigned_helper_id || ""}
                  >
                    <option value="">Unassigned</option>
                    {data.helpers.map((h) => (
                      <option value={h.id} key={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </label>
                {editor.kind === "schedule" ? (
                  <>
                    <label>
                      Frequency
                      <select
                        name="frequency"
                        defaultValue={editor.record.frequency || "daily"}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </label>
                    <label>
                      Day (weekly duties)
                      <select
                        name="day_of_week"
                        defaultValue={editor.record.day_of_week || "Monday"}
                      >
                        {weekdays.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </label>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        name="active"
                        defaultChecked={editor.record.active !== false}
                      />
                      Active schedule
                    </label>
                  </>
                ) : (
                  <>
                    <Field
                      name="location"
                      title="Location"
                      value={editor.record.location}
                    />
                    <label>
                      Priority
                      <select
                        name="priority"
                        defaultValue={editor.record.priority || "medium"}
                      >
                        {["low", "medium", "high"].map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Status
                      <select
                        name="status"
                        defaultValue={editor.record.status || "reported"}
                      >
                        {(editor.record.id
                          ? {
                              reported: ["reported", "assigned"],
                              assigned: ["assigned", "in-progress"],
                              "in-progress": ["in-progress", "done"],
                              done: ["done"],
                            }[editor.record.status || "reported"] || [
                              "reported",
                            ]
                          : ["reported"]
                        ).map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <p className="hint">
                      Assign a helper, then move from assigned to in-progress to
                      done.
                    </p>
                  </>
                )}
              </>
            )}
            {notice && <p role="status">{notice}</p>}
            <div className="actions">
              <button disabled={busy} type="submit">
                {busy ? "Saving…" : "Save " + editor.kind}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setEditor(undefined)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
function Field({
  name,
  title,
  value,
  required = false,
}: {
  name: string;
  title: string;
  value?: string | null;
  required?: boolean;
}) {
  return (
    <label>
      {title}
      {required ? " *" : ""}
      <input
        name={name}
        defaultValue={value || ""}
        required={required}
        maxLength={3000}
      />
    </label>
  );
}
function Empty({ text, href }: { text: string; href?: string }) {
  return (
    <div className="empty">
      <span>◇</span>
      <p>{text}</p>
      {href && <Link href={href}>Add a schedule →</Link>}
    </div>
  );
}
function Duty({
  schedule,
  name,
  log,
  busy,
  submit,
}: {
  schedule: Schedule;
  name: string;
  log?: Snapshot["logs"][number];
  busy: boolean;
  submit: (f: FormData) => Promise<boolean>;
}) {
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const [photoError, setPhotoError] = useState("");
  const [uploading, setUploading] = useState(false);
  async function done(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPhotoError("");
    setUploading(true);
    try {
      if (file) {
        if (file.size > 5 * 1024 * 1024)
          throw new Error("Choose a photo under 5 MB.");
        const meta = new FormData();
        meta.set("type", file.type);
        const result = await photoUpload(meta);
        if (!result.ok || !result.url) throw new Error(result.message);
        const response = await fetch(result.url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!response.ok)
          throw new Error(
            "Photo upload failed. Remove the photo to log without it.",
          );
        form.set("photo_url", result.publicUrl!);
      }
      await submit(form);
    } catch (e) {
      setPhotoError(
        e instanceof Error
          ? e.message
          : "Photo upload failed. Remove the photo to log without it.",
      );
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className={"duty-row " + (log?.status === "done" ? "complete" : "")}>
      <span className="duty-check">{log?.status === "done" ? "✓" : "○"}</span>
      <div className="duty-content">
        <h3>{schedule.title}</h3>
        <p>{schedule.description}</p>
        <small>
          {name}{" "}
          <span>
            · {schedule.frequency === "daily" ? "Daily" : schedule.day_of_week}
          </span>
        </small>
        {log?.status === "done" ? (
          <div className="done-meta">
            ✓ Done · {timestamp(log.created_at)}
            {log.photo_url && (
              <a href={log.photo_url} target="_blank" rel="noreferrer">
                {" "}
                View photo ↗
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={done}>
            <input type="hidden" name="kind" value="log" />
            <input type="hidden" name="duty_schedule_id" value={schedule.id} />
            <details>
              <summary>Add a note or photo (optional)</summary>
              <label>
                Note
                <input
                  name="note"
                  maxLength={3000}
                  placeholder="Anything to share?"
                />
              </label>
              <label>
                Photo
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0])}
                />
              </label>
              {preview && (
                <>
                  <Image
                    unoptimized
                    width={180}
                    height={130}
                    className="preview"
                    src={preview}
                    alt="Selected duty photo preview"
                  />
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setFile(undefined);
                      setPhotoError("");
                      if (fileInput.current) fileInput.current.value = "";
                    }}
                  >
                    Remove photo
                  </button>
                </>
              )}
            </details>
            {photoError && (
              <p role="alert" className="field-error">
                {photoError}
              </p>
            )}
            <button disabled={busy || uploading} type="submit">
              {uploading ? "Saving…" : "✓ Mark done"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
