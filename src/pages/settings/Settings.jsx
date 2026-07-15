import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Camera, History, RotateCcw, UserCog, UserPlus, Users } from "lucide-react";
import ThemeToggle from "../../components/ui/ThemeToggle.jsx";
import PasswordField from "../../components/ui/PasswordField.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  signInWithEmail,
  updateAccountName,
  uploadAccountAvatar,
} from "../../services/supabase/auth.js";
import {
  updateAccountEmail,
  updateAccountPassword,
} from "../../services/supabase/profile.js";
import { createPdaoUser, listPdaoUsers } from "../../services/supabase/pdao.js";
import {
  getDeletedAccounts,
  restoreAccount,
  purgeAccount,
} from "../../services/supabase/accounts.js";
import { subscribeOnline } from "../../services/supabase/presence.js";

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const initials = (name, email) =>
  (name || email || "?").trim().slice(0, 1).toUpperCase();

export default function Settings() {
  const { user, setUser } = useAuth();

  // Edit my own account (name / login email / password).
  const [me, setMe] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [savingMe, setSavingMe] = useState(false);
  const [meMsg, setMeMsg] = useState("");
  const [meError, setMeError] = useState("");

  // Profile picture upload.
  const avatarInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [onlineIds, setOnlineIds] = useState(() => new Set());

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

  // Live online/offline status from Realtime presence.
  useEffect(() => subscribeOnline(setOnlineIds), []);

  // Deleted-account history (soft-deleted PWD + guardian accounts).
  const [deleted, setDeleted] = useState([]);
  const [loadingDeleted, setLoadingDeleted] = useState(true);
  const [busyDeletedId, setBusyDeletedId] = useState(null);

  useEffect(() => {
    (async () => {
      const { records, error } = await getDeletedAccounts();
      if (!error) setDeleted(records);
      setLoadingDeleted(false);
    })();
  }, []);

  const handleRestore = async (rec) => {
    setBusyDeletedId(rec.id);
    const { ok, error } = await restoreAccount({
      targetId: rec.target_id,
      type: rec.account_type,
    });
    if (!ok) {
      toast.error(error?.message || "Unable to restore account.");
    } else {
      setDeleted((prev) => prev.filter((r) => r.id !== rec.id));
      toast.success("Account restored.");
    }
    setBusyDeletedId(null);
  };

  const doPurge = async (rec) => {
    setBusyDeletedId(rec.id);
    const { ok, error } = await purgeAccount({
      targetId: rec.target_id,
      type: rec.account_type,
    });
    if (!ok) {
      toast.error(error?.message || "Unable to permanently delete account.");
    } else {
      setDeleted((prev) => prev.filter((r) => r.id !== rec.id));
      toast.success("Account permanently deleted.");
    }
    setBusyDeletedId(null);
  };

  const confirmPurge = (rec) => {
    const name = rec.snapshot?.full_name || "this account";
    toast(
      ({ closeToast }) => (
        <div className="space-y-3 text-sm text-[color:var(--gov-text)]">
          <p className="font-semibold">Permanently delete?</p>
          <p className="text-xs text-[color:var(--gov-muted)]">
            {`${name} and all their data will be erased for good. This cannot be undone.`}
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeToast}
              className="btn btn-secondary h-9 px-3 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                doPurge(rec);
                closeToast();
              }}
              className="btn btn-danger h-9 px-3 text-xs"
            >
              Delete forever
            </button>
          </div>
        </div>
      ),
      {
        toastId: `purge-${rec.id}`,
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        className: "gov-card",
      }
    );
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarMsg("");
    if (!file.type.startsWith("image/")) {
      setAvatarMsg("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMsg("Image must be 5MB or smaller.");
      return;
    }
    setUploadingAvatar(true);
    const { url, error } = await uploadAccountAvatar(file);
    if (error) {
      setAvatarMsg(error.message || "Unable to upload picture.");
    } else {
      // Reflect immediately in the app shell (also reconciled by USER_UPDATED).
      setUser((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
      toast.success("Profile picture updated.");
    }
    setUploadingAvatar(false);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleSaveMe = async (e) => {
    e.preventDefault();
    setMeMsg("");
    setMeError("");

    if (!me.fullName.trim()) {
      setMeError("Full name cannot be empty.");
      return;
    }

    setSavingMe(true);
    const messages = [];

    // Name change.
    if (me.fullName.trim() !== (user?.fullName ?? "")) {
      const { error } = await updateAccountName(me.fullName.trim());
      if (error) {
        setMeError(error.message || "Unable to update your name.");
        setSavingMe(false);
        return;
      }
      messages.push("Your name has been updated.");
    }

    // Login email change (requires confirmation via email link).
    const emailChanged =
      me.email.trim() && me.email.trim() !== (user?.email ?? "");
    if (emailChanged) {
      const { error } = await updateAccountEmail(me.email.trim());
      if (error) {
        setMeError(error.message || "Unable to update email.");
        setSavingMe(false);
        return;
      }
      messages.push(
        "A confirmation link was sent to your new email; the change applies once confirmed."
      );
    }

    // Password change (re-authenticate with current password first).
    if (me.password) {
      if (!me.currentPassword) {
        setMeError("Enter your current password to set a new one.");
        setSavingMe(false);
        return;
      }
      if (me.password.length < 6) {
        setMeError("New password must be at least 6 characters.");
        setSavingMe(false);
        return;
      }
      if (me.password !== me.confirmPassword) {
        setMeError("New password and confirm password do not match.");
        setSavingMe(false);
        return;
      }
      const { error: authError } = await signInWithEmail(
        user.email,
        me.currentPassword
      );
      if (authError) {
        setMeError("Current password is incorrect.");
        setSavingMe(false);
        return;
      }
      const { error } = await updateAccountPassword(me.password);
      if (error) {
        setMeError(error.message || "Unable to update password.");
        setSavingMe(false);
        return;
      }
      messages.push("Your password has been updated.");
    }

    setMe((prev) => ({
      ...prev,
      currentPassword: "",
      password: "",
      confirmPassword: "",
    }));
    if (messages.length) {
      setMeMsg(messages.join(" "));
      toast.success("Account updated.");
    } else {
      setMeMsg("No changes to save.");
    }
    setSavingMe(false);
  };

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

      {/* Edit my own account */}
      <section className="gov-card p-6">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[color:var(--gov-primary-soft)] text-[color:var(--gov-primary)]"
            aria-hidden="true"
          >
            <UserCog className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold">My account</h3>
            <p className="text-sm text-[color:var(--gov-muted)]">
              Update your photo, name, login email, and password.
            </p>
          </div>
        </div>

        {/* Profile picture */}
        <div className="mt-6 flex flex-wrap items-center gap-5">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-full bg-[color:var(--gov-primary)] text-lg font-semibold text-[color:var(--gov-on-primary)]">
              {initials(me.fullName, user?.email)}
            </div>
          )}
          <div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="btn btn-secondary"
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              {uploadingAvatar ? "Uploading…" : "Change picture"}
            </button>
            <p className="mt-2 text-xs text-[color:var(--gov-muted)]">
              {avatarMsg || "JPG or PNG, up to 5MB."}
            </p>
          </div>
        </div>

        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSaveMe}>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium" htmlFor="me-name">
              Full name<span className="text-[color:var(--gov-danger-fg)]"> *</span>
            </label>
            <input
              id="me-name"
              type="text"
              value={me.fullName}
              onChange={(e) => setMe((p) => ({ ...p, fullName: e.target.value }))}
              className="gov-input"
              placeholder="Your full name"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium" htmlFor="me-email">
              Login email
            </label>
            <input
              id="me-email"
              type="email"
              value={me.email}
              onChange={(e) => setMe((p) => ({ ...p, email: e.target.value }))}
              className="gov-input"
              placeholder="name@pdao.gov.ph"
              autoComplete="username"
            />
          </div>
          <div className="sm:col-span-2">
            <PasswordField
              id="me-current"
              label="Current password"
              hint="Required only when changing your password."
              value={me.currentPassword}
              onChange={(e) =>
                setMe((p) => ({ ...p, currentPassword: e.target.value }))
              }
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
          </div>
          <PasswordField
            id="me-password"
            label="New password"
            value={me.password}
            onChange={(e) => setMe((p) => ({ ...p, password: e.target.value }))}
            placeholder="Leave blank to keep current"
          />
          <PasswordField
            id="me-confirm"
            label="Confirm new password"
            value={me.confirmPassword}
            onChange={(e) =>
              setMe((p) => ({ ...p, confirmPassword: e.target.value }))
            }
            placeholder="Re-enter new password"
          />

          {meError ? (
            <div
              role="alert"
              className="sm:col-span-2 rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
            >
              {meError}
            </div>
          ) : null}
          {meMsg ? (
            <p className="sm:col-span-2 text-sm text-[color:var(--gov-muted)]">
              {meMsg}
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <button type="submit" disabled={savingMe} className="btn btn-primary">
              {savingMe ? "Saving…" : "Update account"}
            </button>
          </div>
        </form>
      </section>

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
            <PasswordField
              id="pdao-pass"
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
            <PasswordField
              id="pdao-confirm"
              label="Confirm password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter the password"
            />

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
                const isOnline = onlineIds.has(acct.id);
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
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          isOnline
                            ? "text-[color:var(--gov-success-fg)]"
                            : "text-[color:var(--gov-muted)]"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isOnline
                              ? "bg-[color:var(--gov-success)]"
                              : "bg-[color:var(--gov-faint)]"
                          }`}
                          aria-hidden="true"
                        />
                        {isOnline ? "Online" : "Offline"}
                      </span>
                      <span className="text-xs text-[color:var(--gov-muted)]">
                        Added {fmtDate(acct.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Deleted history */}
      <section className="gov-card p-6">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[color:var(--gov-primary-soft)] text-[color:var(--gov-primary)]"
            aria-hidden="true"
          >
            <History className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold">Deleted history</h3>
            <p className="text-sm text-[color:var(--gov-muted)]">
              Deleted PWD and guardian accounts. Restore one to bring it back, or
              permanently delete it to erase it for good.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {loadingDeleted ? (
            [0, 1].map((i) => <div key={i} className="gov-skeleton h-16 w-full" />)
          ) : deleted.length === 0 ? (
            <p className="rounded-[var(--radius-md)] bg-[color:var(--gov-surface)] px-4 py-8 text-center text-sm text-[color:var(--gov-muted)]">
              No deleted accounts.
            </p>
          ) : (
            deleted.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium text-[color:var(--gov-text)]">
                    <span className="truncate">
                      {rec.snapshot?.full_name || rec.snapshot?.email || "Account"}
                    </span>
                    <span
                      className={`gov-badge shrink-0 ${
                        rec.account_type === "guardian"
                          ? "gov-badge--warning"
                          : "gov-badge--info"
                      }`}
                    >
                      {rec.account_type === "guardian" ? "Guardian" : "PWD"}
                    </span>
                  </p>
                  <p className="truncate text-sm text-[color:var(--gov-muted)]">
                    {rec.snapshot?.email || rec.snapshot?.pwd_id_number || "—"} ·
                    Deleted {fmtDate(rec.deleted_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRestore(rec)}
                    disabled={busyDeletedId === rec.id}
                    className="btn btn-secondary h-9 px-3 text-xs"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmPurge(rec)}
                    disabled={busyDeletedId === rec.id}
                    className="btn btn-danger h-9 px-3 text-xs"
                  >
                    {busyDeletedId === rec.id ? "…" : "Delete forever"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
