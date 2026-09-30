"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { loadData, loadTimeline } from "@/lib/actions";
import { timestamp, type Audit, type Snapshot } from "@/lib/domain";
export default function MaintenanceDetail({ id }: { id: string }) {
  const [data, setData] = useState<Snapshot>();
  const [events, setEvents] = useState<Audit[]>([]);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([loadData(), loadTimeline(id)]);
      setData(s);
      setEvents(t);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load request.");
    }
  }, [id]);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 15000);
    return () => clearInterval(timer);
  }, [refresh]);
  const request = data?.requests.find((r) => r.id === id);
  return (
    <main className="detail-page">
      <Link href="/maintenance">← Back to maintenance</Link>
      {error ? (
        <div className="error" role="alert">
          {error}
          <button onClick={() => void refresh()}>Retry</button>
        </div>
      ) : !data ? (
        <p>Loading request…</p>
      ) : !request ? (
        <h1>Request not found</h1>
      ) : (
        <>
          <div className="page-heading">
            <div>
              <div className="eyebrow">MAINTENANCE REQUEST</div>
              <h1>{request.title}</h1>
              <p>{request.location || "No location provided"}</p>
            </div>
            <span className={"badge " + request.priority}>
              {request.priority} priority
            </span>
          </div>
          <section className="panel">
            <div className="panel-heading">
              <h2>{request.status}</h2>
              <Link href="/maintenance">Manage request →</Link>
            </div>
            <div className="record-card">
              <p>{request.description || "No description provided."}</p>
              <p>
                Assigned to{" "}
                {data.helpers.find((h) => h.id === request.assigned_helper_id)
                  ?.name || "nobody yet"}
              </p>
              {request.resolved_at && (
                <p>Completed {timestamp(request.resolved_at)}</p>
              )}
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Status timeline</h2>
            </div>
            <ol className="timeline">
              <li>
                <strong>Reported</strong>
                <p>{timestamp(request.created_at)}</p>
              </li>
              {events
                .filter(
                  (e) =>
                    e.action === "update" &&
                    (e.details.before?.status !== e.details.after?.status ||
                      e.details.before?.assigned_helper_id !==
                        e.details.after?.assigned_helper_id),
                )
                .map((e) => (
                  <li key={e.id}>
                    <strong>{e.details.after?.status}</strong>
                    <p>{timestamp(e.created_at)}</p>
                    <small>
                      Assigned to{" "}
                      {data.helpers.find(
                        (h) => h.id === e.details.after?.assigned_helper_id,
                      )?.name || "nobody"}
                    </small>
                  </li>
                ))}
            </ol>
            <div className="panel-footer">
              Status and assignment changes are saved automatically. Earlier
              changes made before audit logging was enabled may not appear.
            </div>
          </section>
        </>
      )}
    </main>
  );
}
