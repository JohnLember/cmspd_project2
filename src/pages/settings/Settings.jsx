import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { UserPlus, Users } from "lucide-react";
import ThemeToggle from "../../components/ui/ThemeToggle.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { createPdaoUser, listPdaoUsers } from "../../services/supabase/pdao.js";

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

export default function Settings() {
  const { user } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { users, error } = await listPdaoUsers();
      if (!isMounted) return;
      if (error) setLoadError(error.message || "Unable to load PDAO accounts.");
      else setAccounts(users);
      setLoadingAccounts(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim() || !email.trim() || !password) {
      setFormError("Full name, email, and password are required.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }

    setCreating(true);
    const { user: created, error } = await createPdaoUser({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });
    if (error) {
      setFormError(error.message || "Unable to create the PDAO account.");
    } else {
      setAccounts((prev) => [...prev, created]);
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirm("");
      toast.success(`PDAO account created for ${created.email}.`);
    }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.01em]">
            System preferences
          </h2>
          <p className="mt-1 text-[color:var(--gov-muted)]">
            Manage appearance and PDAO staff accounts for the portal.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        {/* Create a PDAO account */}
        <div className="gov-card p-6">
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[color:var(--gov-primary-soft)] text-[color:var(--gov-primary)]"
              aria-hidden="true"
            >
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">Add PDAO staff</h3>
              <p className="text-sm text-[color:var(--gov-muted)]">
                Create another administrator account with full PDAO access.
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="pdao-name">
                Full name<span className="text-[color:var(--gov-danger-fg)]"> *</span>
              </label>
              <input
                id="pdao-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="gov-input"
                placeholder="e.g. Maria Santos"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="pdao-email">
                Email<span className="text-[color:var(--gov-danger-fg)]"> *</span>
              </label>
              <input
                id="pdao-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="gov-input"
                placeholder="name@pdao.gov.ph"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="pdao-pass">
                Password<span className="text-[color:var(--gov-danger-fg)]"> *</span>
              </label>
              <input
                id="pdao-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="gov-input"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="pdao-confirm">
                Confirm password
                <span className="text-[color:var(--gov-danger-fg)]"> *</span>
              </label>
              <input
                id="pdao-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="gov-input"
                placeholder="Re-enter the password"
                autoComplete="new-password"
              />
            </div>

            {formError ? (
              <div
                role="alert"
                className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
              >
                {formError}
              </div>
            ) : null}

            <button type="submit" disabled={creating} className="btn btn-primary">
              {creating ? "Creating…" : "Create PDAO account"}
            </button>
          </form>
        </div>

        {/* Existing PDAO accounts */}
        <div className="gov-card p-6">
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[color:var(--gov-primary-soft)] text-[color:var(--gov-primary)]"
              aria-hidden="true"
            >
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">PDAO accounts</h3>
              <p className="text-sm text-[color:var(--gov-muted)]">
                Administrators with access to the PDAO portal.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {loadingAccounts ? (
              [0, 1].map((i) => <div key={i} className="gov-skeleton h-16 w-full" />)
            ) : loadError ? (
              <div
                role="alert"
                className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
              >
                {loadError}
              </div>
            ) : accounts.length === 0 ? (
              <p className="rounded-[var(--radius-md)] bg-[color:var(--gov-surface)] px-4 py-8 text-center text-sm text-[color:var(--gov-muted)]">
                No PDAO accounts found.
              </p>
            ) : (
              accounts.map((acct) => {
                const isYou = acct.email === user?.email;
                return (
                  <div
                    key={acct.id}
                    className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-4"
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--gov-primary-soft)] text-sm font-semibold text-[color:var(--gov-primary)]"
                      aria-hidden="true"
                    >
                      {(acct.fullName || acct.email || "?").slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-medium text-[color:var(--gov-text)]">
                        <span className="truncate">{acct.fullName || acct.email}</span>
                        {isYou ? (
                          <span className="gov-badge gov-badge--info shrink-0">You</span>
                        ) : null}
                      </p>
                      <p className="truncate text-sm text-[color:var(--gov-muted)]">
                        {acct.email}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-[color:var(--gov-muted)]">
                      Added {fmtDate(acct.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
