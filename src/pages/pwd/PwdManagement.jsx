import { Link } from "react-router";

const pwdRows = [
  {
    id: "PWD-1024",
    name: "Maria Santos",
    barangay: "Brgy. San Roque",
    disability: "Visual Disability",
    status: "Active",
  },
  {
    id: "PWD-1041",
    name: "Juan Dela Cruz",
    barangay: "Brgy. San Isidro",
    disability: "Physical Disability",
    status: "Pending",
  },
  {
    id: "PWD-1108",
    name: "Ana Reyes",
    barangay: "Brgy. San Vicente",
    disability: "Psychosocial Disability",
    status: "For review",
  },
];

export default function PwdManagement() {
  return (
    <div className="space-y-6">
      <section className="gov-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-muted)]">
              PWD Management
            </p>
            <h2 className="text-xl font-semibold">Registered PWD Profiles</h2>
            <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
              Manage profiles, verify requirements, and monitor PWD assistance
              status.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-[color:var(--gov-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5"
            >
              Add New PWD
            </button>
            <button
              type="button"
              className="rounded-full border border-[color:var(--gov-border)] px-4 py-2 text-xs font-semibold text-[color:var(--gov-text)] transition hover:-translate-y-0.5"
            >
              Export List
            </button>
          </div>
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
              <option>All barangays</option>
              <option>Brgy. San Roque</option>
              <option>Brgy. San Isidro</option>
              <option>Brgy. San Vicente</option>
            </select>
            <select className="rounded-full border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] px-4 py-2 text-sm">
              <option>All statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>For review</option>
            </select>
          </div>
          <Link
            to="/beneficiary-apply"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--gov-accent)]"
          >
            View beneficiary intake
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-[color:var(--gov-muted)]">
              <tr>
                <th className="pb-3">PWD ID</th>
                <th className="pb-3">Full name</th>
                <th className="pb-3">Barangay</th>
                <th className="pb-3">Disability</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-[color:var(--gov-text)]">
              {pwdRows.map((row) => (
                <tr key={row.id} className="border-t border-[color:var(--gov-border)]">
                  <td className="py-3">{row.id}</td>
                  <td className="py-3">{row.name}</td>
                  <td className="py-3">{row.barangay}</td>
                  <td className="py-3">{row.disability}</td>
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
                      View profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--gov-muted)]">
          <span>Showing 1 to 3 of 248 profiles</span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-[color:var(--gov-border)] px-3 py-1"
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-full border border-[color:var(--gov-border)] px-3 py-1"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
