// Rows for the assistance/subsidy PDF: one per assistance record. PWDs with no
// records produce nothing — the report only lists claimed/unclaimed assistance.
// `recipientsByPwd` maps profile id -> recipient rows (with .announcement).
// `statusFilter` is "all" | "claimed" | "unclaimed".
export function buildAssistanceRows(
  profiles,
  recipientsByPwd,
  subsidyFilter = "all",
  municipalityOf = () => "",
  statusFilter = "all"
) {
  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";

  return profiles.flatMap((p) => {
    const recs = recipientsByPwd.get(p.id) || [];
    return recs
      .filter(
        (r) =>
          (subsidyFilter === "all" ||
            (r.announcement?.subsidy_type || "") === subsidyFilter) &&
          (statusFilter === "all" ||
            (r.status === "received") === (statusFilter === "claimed"))
      )
      .map((r) => {
        const claimed = r.status === "received";
        return {
          name: p.full_name || "—",
          municipality: municipalityOf(p),
          barangay: p.barangay || "",
          subsidy: r.announcement?.subsidy_type || "—",
          item: r.announcement?.item_type || r.announcement?.title || "Assistance",
          qty: r.quantity ?? 1,
          status: claimed ? "Claimed" : "Unclaimed",
          detail: claimed
            ? [fmtDate(r.received_at), r.receipt_number].filter(Boolean).join(" · ")
            : "",
        };
      });
  });
}
