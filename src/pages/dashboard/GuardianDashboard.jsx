import { useEffect, useState } from "react";
import { getMyWards } from "../../services/supabase/guardians.js";
import { disabilityLabel } from "../../constants/disability.js";
import DigitalIdCard from "../../components/pwd/DigitalIdCard.jsx";
import AnnouncementsFeed from "../../components/ui/AnnouncementsFeed.jsx";

export default function GuardianDashboard() {
  const [wards, setWards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { wards: rows, error: loadError } = await getMyWards();
      if (!isMounted) return;
      if (loadError) setError(loadError.message || "Unable to load your wards.");
      else setWards(rows);
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Guardian Overview</h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Monitor the PWD ward(s) under your care — their details and digital ID.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="gov-card rounded-2xl p-6 text-sm text-[color:var(--gov-muted)]">
          Loading your wards…
        </div>
      ) : wards.length === 0 ? (
        <div className="gov-card rounded-2xl p-6 text-sm text-[color:var(--gov-muted)]">
          No PWD ward is linked to your account yet. Please coordinate with the
          PDAO office.
        </div>
      ) : (
        wards.map((link) => {
          const ward = link.ward;
          if (!ward) return null;
          const isOpen = openId === link.id;
          return (
            <section key={link.id} className="gov-card rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {ward.avatar_url ? (
                    <img
                      src={ward.avatar_url}
                      alt={ward.full_name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-[color:var(--gov-primary)] text-sm font-semibold text-white">
                      {(ward.full_name || "PWD")
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p[0]?.toUpperCase())
                        .join("")}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-semibold">
                      {ward.full_name || "—"}
                    </h3>
                    <p className="text-sm text-[color:var(--gov-muted)]">
                      {disabilityLabel(ward.data?.disabilityTypes)}
                      {link.relationship ? ` · ${link.relationship}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : link.id)}
                  className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-xs font-semibold"
                >
                  {isOpen ? "Hide digital ID" : "View digital ID"}
                </button>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--gov-muted)]">
                    Barangay
                  </p>
                  <p className="mt-1">{ward.barangay || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--gov-muted)]">
                    Mobile number
                  </p>
                  <p className="mt-1">{ward.contact_number || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--gov-muted)]">
                    Status
                  </p>
                  <p className="mt-1 capitalize">
                    {ward.application?.status || "registered"}
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

      <section className="gov-card rounded-2xl p-6">
        <h3 className="text-base font-semibold">Announcements</h3>
        <p className="mt-1 text-sm text-[color:var(--gov-muted)]">
          Updates from PDAO.
        </p>
        <div className="mt-4">
          <AnnouncementsFeed emptyText="No announcements from PDAO yet." />
        </div>
      </section>
    </div>
  );
}
