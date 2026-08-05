import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { getProfiles } from "../../services/supabase/profile.js";
import { disabilityLabel } from "../../constants/disability.js";
import { announcementMatches } from "../../utils/announcementTargeting.js";
import { profileMunicipality } from "../../utils/locality.js";

const displayId = (p) =>
  p.pwd_id_number ||
  p.application?.application_number ||
  `PWD-${p.id.slice(0, 8).toUpperCase()}`;

// Modal to pick registered PWDs (excluding those already on the program) and
// add them as recipients. Defaults to the PWDs the announcement already targets
// so a distribution's recipient list is one "Select all" away.
export default function AddRecipientsModal({ announcement, excludeIds, onAdd, onClose }) {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [onlyTargeted, setOnlyTargeted] = useState(true);

  // An announcement with no municipality/barangay/disability target is for
  // everyone, so there is nothing to narrow down.
  const hasTargeting = Boolean(
    announcement &&
      ((announcement.municipalities?.length ?? 0) > 0 ||
        (announcement.barangays?.length ?? 0) > 0 ||
        (announcement.disability_types?.length ?? 0) > 0)
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { profiles: rows } = await getProfiles();
      if (mounted) {
        setProfiles(rows ?? []);
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const available = useMemo(() => {
    const exclude = new Set(excludeIds);
    const term = search.trim().toLowerCase();
    return profiles.filter((p) => {
      if (exclude.has(p.id)) return false;
      if (
        hasTargeting &&
        onlyTargeted &&
        !announcementMatches(
          announcement,
          profileMunicipality(p),
          p.barangay,
          p.data?.disabilityTypes
        )
      )
        return false;
      if (!term) return true;
      return (
        (p.full_name || "").toLowerCase().includes(term) ||
        (p.barangay || "").toLowerCase().includes(term) ||
        (p.data?.municipality || "").toLowerCase().includes(term) ||
        displayId(p).toLowerCase().includes(term)
      );
    });
  }, [profiles, excludeIds, search, announcement, hasTargeting, onlyTargeted]);

  const allPicked = available.length > 0 && available.every((p) => picked.has(p.id));

  const toggle = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleAdd = async () => {
    if (picked.size === 0) return;
    setSaving(true);
    await onAdd([...picked]);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] grid place-items-center p-4">
      <div className="gov-backdrop absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add recipients"
        className="gov-overlay relative flex max-h-[88vh] w-full max-w-lg flex-col p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Add recipients</h3>
            <p className="text-sm text-[color:var(--gov-muted)]">
              Pick registered PWDs to add to this distribution. They stay
              “Unclaimed” in the assistance report until they check in.
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

        <div className="relative mt-4">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--gov-muted)]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, barangay, municipality, or ID"
            className="gov-input pl-9"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {hasTargeting ? (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyTargeted}
                onChange={(e) => setOnlyTargeted(e.target.checked)}
                className="h-4 w-4"
              />
              Only PWDs this announcement targets
            </label>
          ) : (
            <span className="text-sm text-[color:var(--gov-muted)]">
              This announcement targets everyone.
            </span>
          )}
          <button
            type="button"
            onClick={() =>
              setPicked(allPicked ? new Set() : new Set(available.map((p) => p.id)))
            }
            disabled={available.length === 0}
            className="btn btn-ghost h-9 px-3 text-xs"
          >
            {allPicked ? "Clear" : `Select all (${available.length})`}
          </button>
        </div>

        <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
          {isLoading ? (
            [0, 1, 2].map((i) => <div key={i} className="gov-skeleton h-14 w-full" />)
          ) : available.length === 0 ? (
            <p className="py-8 text-center text-sm text-[color:var(--gov-muted)]">
              {profiles.length === 0
                ? "No registered PWDs yet."
                : hasTargeting && onlyTargeted
                  ? "No PWDs match this announcement’s target — untick the box above to pick from everyone."
                  : "No PWDs match — everyone may already be added."}
            </p>
          ) : (
            available.map((p) => {
              const checked = picked.has(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border p-3 ${
                    checked
                      ? "border-[color:var(--gov-primary)] bg-[color:var(--gov-primary-soft)]"
                      : "border-[color:var(--gov-border)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(p.id)}
                    className="h-4 w-4 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[color:var(--gov-text)]">
                      {p.full_name || "—"}
                    </p>
                    <p className="truncate text-xs text-[color:var(--gov-muted)]">
                      {displayId(p)}
                      {[p.barangay, p.data?.municipality].filter(Boolean).length
                        ? ` · ${[p.barangay, p.data?.municipality]
                            .filter(Boolean)
                            .join(", ")}`
                        : ""}
                      {` · ${disabilityLabel(p.data?.disabilityTypes)}`}
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-[color:var(--gov-border)] pt-4">
          <span className="text-sm text-[color:var(--gov-muted)]">
            {picked.size} selected
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={picked.size === 0 || saving}
              className="btn btn-primary"
            >
              {saving ? "Adding…" : `Add ${picked.size || ""}`.trim()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
