const applications = [
  {
    id: "APP-2041",
    name: "Maria Santos",
    type: "New Applicant",
    barangay: "Brgy. San Roque",
    status: "For review",
  },
  {
    id: "APP-2068",
    name: "Juan Dela Cruz",
    type: "Renewal",
    barangay: "Brgy. San Isidro",
    status: "Pending documents",
  },
  {
    id: "APP-2089",
    name: "Ana Reyes",
    type: "New Applicant",
    barangay: "Brgy. San Vicente",
    status: "Validated",
  },
];

export default function Applications() {
  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              Application Management
            </p>
            <h2 className="text-xl font-semibold">PWD Applications Queue</h2>
            <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
              Review submitted applications, verify requirements, and update
              statuses.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5"
          >
            Create Application
          </button>
        </div>
      </section>

      <section className="gov-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name or ID"
              className="rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-2 text-sm"
            />
            <select className="rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-2 text-sm">
              <option>All types</option>
              <option>New Applicant</option>
              <option>Renewal</option>
            </select>
            <select className="rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-2 text-sm">
              <option>All statuses</option>
              <option>For review</option>
              <option>Pending documents</option>
              <option>Validated</option>
            </select>
          </div>
          <button
            type="button"
            className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-xs font-semibold"
          >
            Export list
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-[color:var(--gov-muted)]">
              <tr>
                <th className="pb-3">Application ID</th>
                <th className="pb-3">Applicant</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Barangay</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--gov-text)]">
              {applications.map((row) => (
                <tr key={row.id} className="border-t border-[color:var(--gov-border)]">
                  <td className="py-3">{row.id}</td>
                  <td className="py-3">{row.name}</td>
                  <td className="py-3">{row.type}</td>
                  <td className="py-3">{row.barangay}</td>
                  <td className="py-3">
                    <span className="rounded-full border border-[color:var(--gov-border)] px-3 py-1 text-xs">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      className="text-xs font-semibold text-[color:var(--gov-accent)]"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
