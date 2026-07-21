import { useEffect, useMemo, useState } from "react";
import { X, CheckCircle2, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { PWD_REQUIREMENTS } from "../../constants/requirements.js";
import { PAGE_SIZE, getPageNumbers } from "../../utils/pagination.js";

const displayId = (row) =>
  row.application_number || `APP-${(row.id || "").slice(0, 8).toUpperCase()}`;

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// One applicant's requirement checklist: green = presented, muted = still missing.
function RequirementList({ requirements }) {
  const met = requirements || {};
  return (
    <ul className="mt-2 grid gap-1 sm:grid-cols-2">
      {PWD_REQUIREMENTS.map((req) => {
        const ok = Boolean(met[req]);
        return (
          <li
            key={req}
            className={`flex items-center gap-2 text-xs ${
              ok
                ? "text-[color:var(--gov-success-fg)]"
                : "text-[color:var(--gov-muted)]"
            }`}
          >
            {ok ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>{req}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function PendingApplicantsModal({ applications, onClose }) {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [municipalityFilter, setMunicipalityFilter] = useState("all");
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const years = useMemo(() => {
    const set = new Set();
    applications.forEach((r) => {
      if (r.submitted_at) set.add(new Date(r.submitted_at).getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [applications]);

  const municipalities = useMemo(() => {
    const set = new Set();
    applications.forEach((r) => {
      const m = (r.municipality || "").trim();
      if (m) set.add(m);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [applications]);

  // Barangays scoped to the chosen municipality (names repeat across the province).
  const barangays = useMemo(() => {
    const set = new Set();
    applications.forEach((r) => {
      if (
        municipalityFilter !== "all" &&
        (r.municipality || "").trim() !== municipalityFilter
      )
        return;
      const b = (r.barangay || "").trim();
      if (b) set.add(b);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [applications, municipalityFilter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applications.filter((row) => {
      const matchesSearch =
        !term ||
        displayId(row).toLowerCase().includes(term) ||
        (row.applicant_name || "").toLowerCase().includes(term);
      const matchesYear =
        yearFilter === "all" ||
        (row.submitted_at &&
          new Date(row.submitted_at).getFullYear() === Number(yearFilter));
      const matchesMunicipality =
        municipalityFilter === "all" ||
        (row.municipality || "").trim() === municipalityFilter;
      const matchesBarangay =
        barangayFilter === "all" || (row.barangay || "").trim() === barangayFilter;
      return matchesSearch && matchesYear && matchesMunicipality && matchesBarangay;
    });
  }, [applications, search, yearFilter, municipalityFilter, barangayFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp so shrinking results never strand us on an empty page.
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] grid place-items-center p-4">
      <div
        className="gov-backdrop absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pending applicants"
        className="gov-overlay relative flex max-h-[92vh] w-full max-w-3xl flex-col p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Pending applicants</h2>
            <p className="mt-1 text-sm text-[color:var(--gov-muted)]">
              {filtered.length} of {applications.length} pending
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost h-10 w-10 px-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by application ID or name"
            className="gov-input w-full sm:max-w-xs"
          />
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setPage(1);
            }}
            className="gov-input w-full sm:w-auto"
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={municipalityFilter}
            onChange={(e) => {
              setMunicipalityFilter(e.target.value);
              setBarangayFilter("all");
              setPage(1);
            }}
            className="gov-input w-full sm:w-auto"
          >
            <option value="all">All municipalities</option>
            {municipalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={barangayFilter}
            onChange={(e) => {
              setBarangayFilter(e.target.value);
              setPage(1);
            }}
            className="gov-input w-full sm:w-auto"
          >
            <option value="all">All barangays</option>
            {barangays.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto border-t border-[color:var(--gov-border)] pt-4">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-[color:var(--gov-muted)]">
              {applications.length === 0
                ? "No pending applications."
                : "No pending applicants match your filters."}
            </p>
          ) : (
            pageItems.map((row) => (
              <div
                key={row.id}
                className="rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-[color:var(--gov-text)]">
                    {row.applicant_name || "—"}
                  </span>
                  <span className="font-mono text-xs text-[color:var(--gov-muted)]">
                    {displayId(row)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[color:var(--gov-muted)]">
                  {[row.barangay, row.municipality].filter(Boolean).join(", ") ||
                    "No address"}{" "}
                  · Submitted {fmtDate(row.submitted_at)}
                </p>
                <RequirementList requirements={row.requirements} />
              </div>
            ))
          )}
        </div>

        {totalPages > 1 ? (
          <nav
            className="mt-4 flex items-center justify-between gap-2 border-t border-[color:var(--gov-border)] pt-4"
            aria-label="Pending applicants pages"
          >
            <button
              type="button"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary h-9 px-3 text-xs"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers(currentPage, totalPages).map((p) =>
                typeof p === "number" ? (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={`tnum grid h-9 min-w-9 place-items-center rounded-[var(--radius-md)] px-2 text-xs font-semibold transition-colors ${
                      p === currentPage
                        ? "bg-[color:var(--gov-primary)] text-[color:var(--gov-on-primary)]"
                        : "text-[color:var(--gov-muted)] hover:bg-[color:var(--gov-card)] hover:text-[color:var(--gov-text)]"
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span
                    key={p}
                    className="px-1 text-xs text-[color:var(--gov-faint)]"
                    aria-hidden="true"
                  >
                    …
                  </span>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary h-9 px-3 text-xs"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
