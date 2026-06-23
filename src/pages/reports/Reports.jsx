import { useEffect, useMemo, useState } from "react";
import { Activity, Download, MapPin, Printer, Users } from "lucide-react";
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
    p.pwd_id_number ||
    p.application?.application_number ||
    `PWD-${p.id.slice(0, 8).toUpperCase()}`;

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
      <header className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">
            Registered PWDs per barangay
          </h2>
          <p className="mt-1 text-[color:var(--gov-muted)]">
            Monitoring report classified by disability type.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowExport(true)}
            disabled={isLoading || report.total === 0}
            className="btn btn-secondary h-10 px-4 text-xs"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={isLoading || report.total === 0}
            className="btn btn-primary h-10 px-4 text-xs"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print / Save as PDF
          </button>
        </div>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)] print:hidden"
        >
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="gov-card p-6">
          <div className="gov-skeleton h-6 w-48" />
        </div>
      ) : report.total === 0 ? (
        <div className="gov-card p-8 text-center text-sm text-[color:var(--gov-muted)]">
          No registered PWDs yet. Approve applications to populate this report.
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Registered PWDs" value={report.total} icon={Users} tone="primary" />
            <StatCard label="Barangays covered" value={report.barangayCount} icon={MapPin} tone="success" />
            <StatCard
              label="Disability types"
              value={report.typeColumns.filter((t) => t !== "unspecified").length}
              icon={Activity}
              tone="warning"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <BarChartCard
              title="Registered PWDs per barangay"
              subtitle="All registered"
              data={report.perBarangayChart}
            />
            <BarChartCard
              title="By disability type"
              subtitle="All registered"
              data={report.perTypeChart}
            />
          </section>

          <section className="gov-card p-5">
            <h3 className="font-semibold text-[color:var(--gov-text)]">
              Barangay × disability type
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--gov-border)] text-xs font-semibold text-[color:var(--gov-muted)]">
                    <th className="pb-3 pr-4 font-semibold">Barangay</th>
                    {report.typeColumns.map((t) => (
                      <th key={t} className="pb-3 pr-4 text-center font-semibold">
                        {label(t)}
                      </th>
                    ))}
                    <th className="pb-3 text-center font-semibold text-[color:var(--gov-text)]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[color:var(--gov-text)]">
                  {report.barangays.map((b) => (
                    <tr
                      key={b}
                      className="border-b border-[color:var(--gov-border)]"
                    >
                      <td className="py-3 pr-4 font-medium">{b}</td>
                      {report.typeColumns.map((t) => (
                        <td key={t} className="py-3 pr-4 text-center text-[color:var(--gov-muted)]">
                          {report.byBarangay[b].types[t] || 0}
                        </td>
                      ))}
                      <td className="py-3 text-center font-semibold">
                        {report.byBarangay[b].total}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[color:var(--gov-border-strong)] font-semibold">
                    <td className="py-3 pr-4">All barangays</td>
                    {report.typeColumns.map((t) => (
                      <td key={t} className="py-3 pr-4 text-center">
                        {report.typeCounts[t] || 0}
                      </td>
                    ))}
                    <td className="py-3 text-center text-[color:var(--gov-primary)]">
                      {report.total}
                    </td>
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
