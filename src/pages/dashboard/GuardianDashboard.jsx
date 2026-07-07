import { useCallback, useEffect, useState } from "react";
import { getMyWards } from "../../services/supabase/guardians.js";
import { disabilityLabel } from "../../constants/disability.js";
import DigitalIdCard from "../../components/pwd/DigitalIdCard.jsx";
import AnnouncementsFeed from "../../components/ui/AnnouncementsFeed.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { useRealtime } from "../../hooks/useRealtime.js";

export default function GuardianDashboard() {
  const [wards, setWards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    const { wards: rows, error: loadError } = await getMyWards();
    if (loadError) setError(loadError.message || "Unable to load your wards.");
    else setWards(rows);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  // Live: ward profile/approval changes and new ward links update in place.
  // RLS scopes these events to this guardian's own ward(s).
  useRealtime("profiles", load);
  useRealtime("guardian_ward_links", load);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">
          Guardian overview
        </h2>
        <p className="mt-1 text-[color:var(--gov-muted)]">
          Monitor the PWD ward(s) under your care — their details and Digital ID.
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
        >
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="gov-card p-6">
          <div className="gov-skeleton h-16 w-full" />
        </div>
      ) : wards.length === 0 ? (
        <div className="gov-card p-8 text-center text-sm text-[color:var(--gov-muted)]">
          No PWD ward is linked to your account yet. Please coordinate with the
          PDAO office.
        </div>
      ) : (
        wards.map((link) => {
          const ward = link.ward;
          if (!ward) return null;
          const isOpen = openId === link.id;
          return (
            <section key={link.id} className="gov-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {ward.avatar_url ? (
                    <img
                      src={ward.avatar_url}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--gov-primary)] text-sm font-semibold text-[color:var(--gov-on-primary)]">
                      {(ward.full_name || "PWD")
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p[0]?.toUpperCase())
                        .join("")}
                    </div>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">
                        {ward.full_name || "—"}
                      </h3>
                      {ward.active === false ? (
                        <span className="gov-badge gov-badge--danger">
                          Deactivated account
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-[color:var(--gov-muted)]">
                      {disabilityLabel(ward.data?.disabilityTypes)}
                      {link.relationship ? ` · ${link.relationship}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : link.id)}
                  className="btn btn-secondary"
                  aria-expanded={isOpen}
                >
                  {isOpen ? "Hide Digital ID" : "View Digital ID"}
                </button>
              </div>

              <div className="mt-5 grid gap-4 border-t border-[color:var(--gov-border)] pt-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-[color:var(--gov-muted)]">
                    Barangay
                  </p>
                  <p className="mt-1">{ward.barangay || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[color:var(--gov-muted)]">
                    Mobile number
                  </p>
                  <p className="mt-1">{ward.contact_number || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[color:var(--gov-muted)]">
                    Status
                  </p>
                  <p className="mt-1">
                    <StatusBadge status={ward.application?.status || "registered"} />
                  </p>
                </div>
              </div>

              {isOpen ? (
                <div className="mt-6">
                  <DigitalIdCard profile={ward} />
                </div>
              ) : null}
            </section>
          );
        })
      )}

      <section className="gov-card p-6">
        <h3 className="font-semibold">Announcements</h3>
        <p className="mt-1 text-sm text-[color:var(--gov-muted)]">Updates from PDAO.</p>
        <div className="mt-4">
          <AnnouncementsFeed paginate emptyText="No announcements from PDAO yet." />
        </div>
      </section>
    </div>
  );
}
