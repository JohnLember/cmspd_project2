import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Activity, FileDown, MapPin, Users } from "lucide-react";
import BarChartCard from "../../components/charts/BarChartCard.jsx";
import StatCard from "../../components/cards/StatCard.jsx";
import ExportReportModal from "../../components/reports/ExportReportModal.jsx";
import { getProfiles } from "../../services/supabase/profile.js";
import { getAllRecipients } from "../../services/supabase/recipients.js";
import { DISABILITY_LABELS } from "../../constants/disability.js";
import { exportAgeProfilePdf } from "../../utils/ReportsPDF.js";
import { exportAssistancePdf } from "../../utils/AssistancePDF.js";
import { buildAssistanceRows } from "../../utils/assistanceRows.js";
import { SUBSIDY_TYPES } from "../../constants/subsidy.js";
import { profileMunicipality, UNSPECIFIED } from "../../utils/locality.js";

export default function Reports() {
  const [profiles, setProfiles] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportMode, setExportMode] = useState("age"); // "age" | "assistance"
  // "all" = province summary grouped by municipality; a name = drill into that
  // municipality's barangays.
  const [viewMunicipality, setViewMunicipality] = useState("all");
  const [exportMunicipality, setExportMunicipality] = useState("all");
  const [exportBarangay, setExportBarangay] = useState("all");
  const [exportType, setExportType] = useState("all");
  const [exportSubsidy, setExportSubsidy] = useState("all");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [{ profiles: rows, error: fetchError }, { recipients: recs }] =
        await Promise.all([getProfiles(), getAllRecipients()]);
      if (!isMounted) return;
      if (fetchError) setError(fetchError.message || "Unable to load report data.");
      else setProfiles(rows);
      setRecipients(recs || []);
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const municipalities = useMemo(() => {
    const set = new Set(profiles.map((p) => profileMunicipality(p)));
    set.delete(UNSPECIFIED);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [profiles]);

  const report = useMemo(() => {
    // Province view groups by municipality; a drilled view groups that
    // municipality's rows by barangay.
    const scoped =
      viewMunicipality === "all"
        ? profiles
        : profiles.filter((p) => profileMunicipality(p) === viewMunicipality);
    const groupOf = (p) =>
      viewMunicipality === "all"
        ? profileMunicipality(p)
        : (p.barangay || "").trim() || UNSPECIFIED;

    const groupSet = new Set();
    const typeCounts = {};
    const byGroup = {}; // group -> { total, types: {type: n} }

    scoped.forEach((p) => {
      const group = groupOf(p);
      groupSet.add(group);
      byGroup[group] ??= { total: 0, types: {} };
      byGroup[group].total += 1;

      const types = Array.isArray(p.data?.disabilityTypes)
        ? p.data.disabilityTypes
        : [];
      const effective = types.length ? types : ["unspecified"];
      effective.forEach((t) => {
        typeCounts[t] = (typeCounts[t] || 0) + 1;
        byGroup[group].types[t] = (byGroup[group].types[t] || 0) + 1;
      });
    });

    // Disability columns: known order first, then any extras (incl. unspecified).
    const known = Object.keys(DISABILITY_LABELS).filter((t) => typeCounts[t]);
    const extras = Object.keys(typeCounts).filter(
      (t) => !DISABILITY_LABELS[t]
    );
    const typeColumns = [...known, ...extras];

    const groups = Array.from(groupSet).sort((a, b) => a.localeCompare(b));

    return {
      total: scoped.length,
      groupLabel: viewMunicipality === "all" ? "Municipality" : "Barangay",
      municipalityCount: municipalities.length,
      groupCount: groups.filter((g) => g !== UNSPECIFIED).length,
      typeCounts,
      typeColumns,
      groups,
      byGroup,
      perGroupChart: groups.map((g) => ({
        name: g,
        value: byGroup[g].total,
      })),
      perTypeChart: typeColumns.map((t) => ({
        name: DISABILITY_LABELS[t] || "Unspecified",
        value: typeCounts[t],
      })),
    };
  }, [profiles, viewMunicipality, municipalities]);

  const label = (t) => DISABILITY_LABELS[t] || "Unspecified";

  // Barangays available in the export modal, scoped to the chosen municipality.
  const exportBarangays = useMemo(() => {
    const set = new Set();
    profiles.forEach((p) => {
      if (
        exportMunicipality !== "all" &&
        profileMunicipality(p) !== exportMunicipality
      )
        return;
      const b = (p.barangay || "").trim();
      if (b) set.add(b);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [profiles, exportMunicipality]);

  // Profiles matching the chosen municipality + barangay + disability type.
  const exportMatches = useMemo(() => {
    return profiles.filter((p) => {
      const m = profileMunicipality(p);
      const b = (p.barangay || "").trim() || UNSPECIFIED;
      const types = Array.isArray(p.data?.disabilityTypes)
        ? p.data.disabilityTypes
        : [];
      const effectiveTypes = types.length ? types : ["unspecified"];
      const matchMunicipality =
        exportMunicipality === "all" || m === exportMunicipality;
      const matchBarangay = exportBarangay === "all" || b === exportBarangay;
      const matchType = exportType === "all" || effectiveTypes.includes(exportType);
      return matchMunicipality && matchBarangay && matchType;
    });
  }, [profiles, exportMunicipality, exportBarangay, exportType]);

  // pwd_id -> assistance records (from every distribution).
  const recipientsByPwd = useMemo(() => {
    const map = new Map();
    recipients.forEach((r) => {
      if (!map.has(r.pwd_id)) map.set(r.pwd_id, []);
      map.get(r.pwd_id).push(r);
    });
    return map;
  }, [recipients]);

  const assistanceRows = useMemo(
    () =>
      buildAssistanceRows(
        exportMatches,
        recipientsByPwd,
        exportSubsidy,
        profileMunicipality
      ),
    [exportMatches, recipientsByPwd, exportSubsidy]
  );

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const parts = [];
      if (exportMunicipality !== "all")
        parts.push(`Municipality: ${exportMunicipality}`);
      if (exportBarangay !== "all") parts.push(`Barangay: ${exportBarangay}`);
      if (exportType !== "all") parts.push(`Disability: ${label(exportType)}`);
      if (exportMode === "assistance" && exportSubsidy !== "all")
        parts.push(`Subsidy: ${exportSubsidy}`);
      const scopeText = parts.join("   •   ");
      // Single-municipality export names it in the PDF header; else province-wide.
      const municipalityScope =
        exportMunicipality === "all" ? null : exportMunicipality;
      if (exportMode === "assistance") {
        await exportAssistancePdf(assistanceRows, scopeText, municipalityScope);
      } else {
        await exportAgeProfilePdf(exportMatches, scopeText, municipalityScope);
      }
      setShowExport(false);
    } catch (err) {
      toast.error(err?.message || "Unable to generate the PDF report.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">
            {viewMunicipality === "all"
              ? "Registered PWDs per municipality"
              : `Registered PWDs in ${viewMunicipality} per barangay`}
          </h2>
          <p className="mt-1 text-[color:var(--gov-muted)]">
            Monitoring report classified by disability type.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={viewMunicipality}
            onChange={(e) => setViewMunicipality(e.target.value)}
            className="gov-input h-10 w-full text-xs sm:w-auto"
            aria-label="Filter by municipality"
          >
            <option value="all">All municipalities</option>
            {municipalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setExportMode("age");
              setShowExport(true);
            }}
            disabled={isLoading || report.total === 0}
            className="btn btn-secondary h-10 px-4 text-xs"
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Age-profile PDF
          </button>
          <button
            type="button"
            onClick={() => {
              setExportMode("assistance");
              setShowExport(true);
            }}
            disabled={isLoading || report.total === 0}
            className="btn btn-primary h-10 px-4 text-xs"
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Assistance PDF
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
            <StatCard
              label={
                viewMunicipality === "all"
                  ? "Municipalities covered"
                  : "Barangays covered"
              }
              value={
                viewMunicipality === "all"
                  ? report.municipalityCount
                  : report.groupCount
              }
              icon={MapPin}
              tone="success"
            />
            <StatCard
              label="Disability types"
              value={report.typeColumns.filter((t) => t !== "unspecified").length}
              icon={Activity}
              tone="warning"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <BarChartCard
              title={
                viewMunicipality === "all"
                  ? "Registered PWDs per municipality"
                  : "Registered PWDs per barangay"
              }
              subtitle="All registered"
              data={report.perGroupChart}
            />
            <BarChartCard
              title="By disability type"
              subtitle="All registered"
              data={report.perTypeChart}
            />
          </section>

          <section className="gov-card p-5">
            <h3 className="font-semibold text-[color:var(--gov-text)]">
              {report.groupLabel} × disability type
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="tnum w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--gov-border)] text-xs font-semibold text-[color:var(--gov-muted)]">
                    <th className="pb-3 pr-4 font-semibold">{report.groupLabel}</th>
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
                  {report.groups.map((g) => (
                    <tr
                      key={g}
                      className="border-b border-[color:var(--gov-border)]"
                    >
                      <td className="py-3 pr-4 font-medium">{g}</td>
                      {report.typeColumns.map((t) => (
                        <td key={t} className="py-3 pr-4 text-center text-[color:var(--gov-muted)]">
                          {report.byGroup[g].types[t] || 0}
                        </td>
                      ))}
                      <td className="py-3 text-center font-semibold">
                        {report.byGroup[g].total}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[color:var(--gov-border-strong)] font-semibold">
                    <td className="py-3 pr-4">
                      {viewMunicipality === "all"
                        ? "All municipalities"
                        : "All barangays"}
                    </td>
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
          title={
            exportMode === "assistance"
              ? "Export assistance record"
              : "Export report"
          }
          subtitle={
            exportMode === "assistance"
              ? "Choose the subsidy type, municipality, barangay and disability type, then export the PWD assistance/subsidy record (claimed & unclaimed)."
              : "Choose a barangay and disability type, then export the age-profile PDF."
          }
          ctaLabel={exportMode === "assistance" ? "Export record" : "Export PDF"}
          municipalities={municipalities}
          barangays={exportBarangays}
          typeColumns={report.typeColumns}
          municipality={exportMunicipality}
          barangay={exportBarangay}
          type={exportType}
          subsidyTypes={exportMode === "assistance" ? SUBSIDY_TYPES : null}
          subsidy={exportSubsidy}
          onSubsidyChange={setExportSubsidy}
          matchCount={
            exportMode === "assistance"
              ? assistanceRows.length
              : exportMatches.length
          }
          matchNoun={exportMode === "assistance" ? "record" : "PWD"}
          exporting={isExporting}
          onMunicipalityChange={(m) => {
            setExportMunicipality(m);
            setExportBarangay("all");
          }}
          onBarangayChange={setExportBarangay}
          onTypeChange={setExportType}
          onExport={handleExportPdf}
          onClose={() => setShowExport(false)}
        />
      ) : null}
    </div>
  );
}
