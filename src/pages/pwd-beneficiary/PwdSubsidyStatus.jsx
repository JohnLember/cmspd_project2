import { useEffect, useMemo, useState } from "react";
import { getMySubsidies } from "../../services/supabase/subsidies.js";
import {
  formatPeso,
  subsidyTypeLabel,
} from "../../constants/subsidies.js";

const statusClasses = {
  released: "bg-green-100 text-green-700",
  scheduled: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function PwdSubsidyStatus() {
  const [subsidies, setSubsidies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { subsidies: rows, error: loadError } = await getMySubsidies();
      if (!isMounted) return;
      if (loadError) setError(loadError.message || "Unable to load your subsidies.");
      else setSubsidies(rows);
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const released = subsidies.filter((s) => s.status === "released");
    const totalReleased = released.reduce(
      (sum, s) => sum + (Number(s.amount) || 0),
      0
    );
    const upcoming = subsidies
      .filter((s) => s.status === "scheduled" && s.scheduled_date)
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))[0];
    return {
      totalReleased,
      releasedCount: released.length,
      nextDate: upcoming?.scheduled_date || null,
    };
  }, [subsidies]);

  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Subsidy Status</h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Track your assistance records and payout schedule.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              Total received
            </p>
            <p className="mt-2 text-sm font-semibold">
              {isLoading ? "…" : formatPeso(summary.totalReleased)}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              Releases received
            </p>
            <p className="mt-2 text-sm font-semibold">
              {isLoading ? "…" : summary.releasedCount}
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              Next scheduled
            </p>
            <p className="mt-2 text-sm font-semibold">
              {isLoading ? "…" : summary.nextDate || "None"}
            </p>
          </div>
        </div>
      </section>

      <section className="gov-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
          Assistance history
        </h3>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-[color:var(--gov-muted)]">
              <tr>
                <th className="pb-3">Type</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Scheduled</th>
                <th className="pb-3">Released</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--gov-text)]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[color:var(--gov-muted)]">
                    Loading…
                  </td>
                </tr>
              ) : subsidies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[color:var(--gov-muted)]">
                    No subsidy records yet. PDAO will post your assistance here.
                  </td>
                </tr>
              ) : (
                subsidies.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-[color:var(--gov-border)]"
                  >
                    <td className="py-3">
                      <div className="font-medium">{subsidyTypeLabel(s.type)}</div>
                      {s.description ? (
                        <div className="text-xs text-[color:var(--gov-muted)]">
                          {s.description}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3">{formatPeso(s.amount)}</td>
                    <td className="py-3">{s.scheduled_date || "—"}</td>
                    <td className="py-3">{s.released_date || "—"}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          statusClasses[s.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
