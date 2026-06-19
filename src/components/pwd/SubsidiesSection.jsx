import { useEffect, useState } from "react";
import {
  addSubsidy,
  getSubsidiesForPwd,
} from "../../services/supabase/subsidies.js";
import {
  SUBSIDY_STATUSES,
  SUBSIDY_TYPES,
  formatPeso,
  subsidyTypeLabel,
} from "../../constants/subsidies.js";

const field =
  "mt-1 w-full rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-3 py-2 text-sm";

const emptyForm = {
  type: "financial",
  amount: "",
  status: "scheduled",
  scheduled_date: "",
  released_date: "",
  description: "",
};

export default function SubsidiesSection({ pwdId }) {
  const [subsidies, setSubsidies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { subsidies: rows, error: loadError } = await getSubsidiesForPwd(pwdId);
      if (!isMounted) return;
      if (loadError) setError(loadError.message || "Unable to load subsidies.");
      else setSubsidies(rows);
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [pwdId]);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleAdd = async () => {
    setError("");
    setSaving(true);
    const payload = {
      type: form.type,
      amount: form.amount === "" ? null : Number(form.amount),
      status: form.status,
      scheduled_date: form.scheduled_date || null,
      released_date: form.released_date || null,
      description: form.description.trim() || null,
    };
    const { subsidy, error: addError } = await addSubsidy(pwdId, payload);
    if (addError) {
      setError(addError.message || "Unable to add subsidy.");
    } else if (subsidy) {
      setSubsidies((prev) => [subsidy, ...prev]);
      setForm(emptyForm);
    }
    setSaving(false);
  };

  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-[color:var(--gov-muted)]">
        Subsidies
      </h3>

      {error ? (
        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-[color:var(--gov-muted)]">
            <tr>
              <th className="pb-2">Type</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Scheduled</th>
              <th className="pb-2">Released</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="text-[color:var(--gov-text)]">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-[color:var(--gov-muted)]">
                  Loading…
                </td>
              </tr>
            ) : subsidies.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-[color:var(--gov-muted)]">
                  No subsidies recorded.
                </td>
              </tr>
            ) : (
              subsidies.map((s) => (
                <tr key={s.id} className="border-t border-[color:var(--gov-border)]">
                  <td className="py-2">{subsidyTypeLabel(s.type)}</td>
                  <td className="py-2">{formatPeso(s.amount)}</td>
                  <td className="py-2">{s.scheduled_date || "—"}</td>
                  <td className="py-2">{s.released_date || "—"}</td>
                  <td className="py-2 capitalize">{s.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-2xl border border-[color:var(--gov-border)] p-4">
        <p className="text-sm font-semibold">Record a subsidy</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-[color:var(--gov-muted)]">Type</label>
            <select value={form.type} onChange={set("type")} className={field}>
              {SUBSIDY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[color:var(--gov-muted)]">
              Amount (₱)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={set("amount")}
              className={field}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[color:var(--gov-muted)]">Status</label>
            <select value={form.status} onChange={set("status")} className={field}>
              {SUBSIDY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[color:var(--gov-muted)]">
              Scheduled date
            </label>
            <input
              type="date"
              value={form.scheduled_date}
              onChange={set("scheduled_date")}
              className={field}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[color:var(--gov-muted)]">
              Released date
            </label>
            <input
              type="date"
              value={form.released_date}
              onChange={set("released_date")}
              className={field}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[color:var(--gov-muted)]">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={set("description")}
              className={field}
              placeholder="Optional"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving}
            className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Add subsidy"}
          </button>
        </div>
      </div>
    </div>
  );
}
