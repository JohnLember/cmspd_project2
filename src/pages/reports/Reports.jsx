import { useEffect, useMemo, useState } from "react";
import BarChartCard from "../../components/charts/BarChartCard.jsx";
import StatCard from "../../components/cards/StatCard.jsx";
import ExportReportModal from "../../components/reports/ExportReportModal.jsx";
import { getProfiles } from "../../services/supabase/profile.js";
import { DISABILITY_LABELS, disabilityLabel } from "../../constants/disability.js";

const UNSPECIFIED = "Unspecified";

const downloadCsv = (filename, rows) => {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(escape).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default function Reports() {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [exportBarangay, setExportBarangay] = useState("all");
  const [exportType, setExportType] = useState("all");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { profiles: rows, error: fetchError } = await getProfiles();
      if (!isMounted) return;
      if (fetchError) setError(fetchError.message || "Unable to load report data.");
      else setProfiles(rows);
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const report = useMemo(() => {
    const barangaySet = new Set();
    const typeCounts = {};
    const byBarangay = {}; // barangay -> { total, types: {type: n} }

    profiles.forEach((p) => {
      const barangay = (p.barangay || "").trim() || UNSPECIFIED;
      barangaySet.add(barangay);
      byBarangay[barangay] ??= { total: 0, types: {} };
      byBarangay[barangay].total += 1;

      const types = Array.isArray(p.data?.disabilityTypes)
        ? p.data.disabilityTypes
        : [];
      const effective = types.length ? types : ["unspecified"];
      effective.forEach((t) => {
        typeCounts[t] = (typeCounts[t] || 0) + 1;
        byBarangay[barangay].types[t] =
          (byBarangay[barangay].types[t] || 0) + 1;
      });
    });

    // Disability columns: known order first, then any extras (incl. unspecified).
    const known = Object.keys(DISABILITY_LABELS).filter((t) => typeCounts[t]);
    const extras = Object.keys(typeCounts).filter(
      (t) => !DISABILITY_LABELS[t]
    );
    const typeColumns = [...known, ...extras];

    const barangays = Array.from(barangaySet).sort((a, b) =>
      a.localeCompare(b)
    );

    return {
      total: profiles.length,
      barangayCount: barangays.filter((b) => b !== UNSPECIFIED).length,
      typeCounts,
      typeColumns,
      barangays,
      byBarangay,
      perBarangayChart: barangays.map((b) => ({
        name: b,
        value: byBarangay[b].total,
      })),
      perTypeChart: typeColumns.map((t) => ({
        name: DISABILITY_LABELS[t] || "Unspecified",
        value: typeCounts[t],
      })),
    };
  }, [profiles]);

  const label = (t) => DISABILITY_LABELS[t] || "Unspecified";

  const pwdId = (p) =>
    p.application?.application_number || `PWD-${p.id.slice(0, 8).toUpperCase()}`;

  // Registered PWDs matching the chosen barangay + disability-type filters.
  const exportMatches = useMemo(() => {
    return profiles.filter((p) => {
      const b = (p.barangay || "").trim() || UNSPECIFIED;
      const types = Array.isArray(p.data?.disabilityTypes)
        ? p.data.disabilityTypes
        : [];
      const effectiveTypes = types.length ? types : ["unspecified"];
      const matchBarangay = exportBarangay === "all" || b === exportBarangay;
      const matchType = exportType === "all" || effectiveTypes.includes(exportType);
      return matchBarangay && matchType;
    });
  }, [profiles, exportBarangay, exportType]);

  const handleExport = () => {
    const header = ["PWD ID", "Name", "Barangay", "Disability type(s)", "Mobile"];
    const body = exportMatches.map((p) => [
      pwdId(p),
      p.full_name || "",
      (p.barangay || "").trim() || UNSPECIFIED,
      disabilityLabel(p.data?.disabilityTypes),
      p.contact_number || "",
    ]);
    const slug = (v) =>
      v === "all" ? "all" : String(v).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    downloadCsv(
      `pwd-report-${slug(exportBarangay)}-${slug(exportType)}.csv`,
      [header, ...body]
    );
    setShowExport(false);
  };

  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              Reports Center
            </p>
            <h2 className="text-xl font-semibold">
              Registered PWDs per Barangay
            </h2>
            <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
              Monitoring report classified by disability type.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowExport(true)}
              disabled={isLoading || report.total === 0}
              className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-xs font-semibold disabled:opacity-50"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={isLoading || report.total === 0}
              className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 print:hidden">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="gov-card rounded-2xl p-6 text-sm text-[color:var(--gov-muted)]">
          Loading report…
        </div>
      ) : report.total === 0 ? (
        <div className="gov-card rounded-2xl p-6 text-sm text-[color:var(--gov-muted)]">
          No registered PWDs yet. Approve applications to populate this report.
        </div>
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            <StatCard label="Registered PWDs" value={report.total} />
            <StatCard label="Barangays covered" value={report.barangayCount} />
            <StatCard
              label="Disability types"
              value={report.typeColumns.filter((t) => t !== "unspecified").length}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <BarChartCard
              title="Registered PWDs per Barangay"
              subtitle="All registered"
              data={report.perBarangayChart}
            />
            <BarChartCard
              title="By Disability Type"
              subtitle="All registered"
              data={report.perTypeChart}
            />
          </section>

          <section className="gov-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[color:var(--gov-text)]">
              Barangay × Disability Type
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-[color:var(--gov-muted)]">
                  <tr>
                    <th className="pb-3 pr-4">Barangay</th>
                    {report.typeColumns.map((t) => (
                      <th key={t} className="pb-3 pr-4 text-center">
                        {label(t)}
                      </th>
                    ))}
                    <th className="pb-3 text-center font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="text-[color:var(--gov-text)]">
                  {report.barangays.map((b) => (
                    <tr
                      key={b}
                      className="border-t border-[color:var(--gov-border)]"
                    >
                      <td className="py-3 pr-4">{b}</td>
                      {report.typeColumns.map((t) => (
                        <td key={t} className="py-3 pr-4 text-center">
                          {report.byBarangay[b].types[t] || 0}
                        </td>
                      ))}
                      <td className="py-3 text-center font-semibold">
                        {report.byBarangay[b].total}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[color:var(--gov-border)] font-semibold">
                    <td className="py-3 pr-4">All barangays</td>
                    {report.typeColumns.map((t) => (
                      <td key={t} className="py-3 pr-4 text-center">
                        {report.typeCounts[t] || 0}
                      </td>
                    ))}
                    <td className="py-3 text-center">{report.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {showExport ? (
        <ExportReportModal
          barangays={report.barangays}
          typeColumns={report.typeColumns}
          barangay={exportBarangay}
          type={exportType}
          matchCount={exportMatches.length}
          onBarangayChange={setExportBarangay}
          onTypeChange={setExportType}
          onExport={handleExport}
          onClose={() => setShowExport(false)}
        />
      ) : null}
    </div>
  );
}
