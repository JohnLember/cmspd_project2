import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { AlertTriangle, HeartHandshake, Phone, ShieldCheck } from "lucide-react";
import { signInWithEmail } from "../../services/supabase/auth.js";
import {
  getMyProfile,
  sendEmailOtp,
  updateAccountEmail,
  updateAccountPassword,
  updateProfile,
  uploadAvatar,
  verifyEmailOtp,
} from "../../services/supabase/profile.js";
import { getMyGuardians } from "../../services/supabase/guardians.js";
import { sendSmsOtp, verifySmsOtp } from "../../services/supabase/sms.js";
import { DISABILITY_LABELS } from "../../constants/disability.js";

const SEX_OPTIONS = [
  { value: "", label: "Select sex" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "prefer-not", label: "Prefer not to say" },
];

const CIVIL_OPTIONS = [
  { value: "", label: "Select civil status" },
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
  { value: "cohabitation", label: "Cohabitation (Live-in)" },
];

const initials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PWD";

const guardianInitials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "G";

const fieldClass = "gov-input mt-2";

export default function PwdProfile() {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [guardians, setGuardians] = useState([]);

  const [form, setForm] = useState({
    full_name: "",
    contact_number: "",
    personal_email: "",
    address: "",
    barangay: "",
    birthdate: "",
    sex: "",
    civil_status: "",
    contactPerson: "",
    telNos: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [avatarMsg, setAvatarMsg] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [account, setAccount] = useState({ email: "", currentPassword: "", password: "", confirmPassword: "" });
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMsg, setAccountMsg] = useState("");

  // Personal email verification (code sent via Resend).
  const [otp, setOtp] = useState({
    open: false,
    code: "",
    sending: false,
    verifying: false,
    msg: "",
  });

  // Mobile number verification (code sent via Semaphore SMS).
  const [smsOtp, setSmsOtp] = useState({
    open: false,
    code: "",
    sending: false,
    verifying: false,
    msg: "",
  });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { profile: row, user: authUser, error } = await getMyProfile();
      if (!isMounted) return;
      if (error) {
        setLoadError(error.message || "Unable to load your profile.");
      } else {
        setProfile(row);
        setUser(authUser);
        setForm({
          full_name: row.full_name ?? "",
          contact_number: row.contact_number ?? "",
          personal_email: row.personal_email ?? "",
          address: row.address ?? "",
          barangay: row.barangay ?? "",
          birthdate: row.birthdate ?? "",
          sex: row.sex ?? "",
          civil_status: row.civil_status ?? "",
          contactPerson: row.data?.contactPerson ?? "",
          telNos: row.data?.telNos ?? "",
        });
        setAccount({ email: authUser.email ?? "", currentPassword: "", password: "", confirmPassword: "" });
      }
      const { guardians: guardianRows } = await getMyGuardians();
      if (isMounted) setGuardians(guardianRows ?? []);
      setIsLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const disabilityTypes = Array.isArray(profile?.data?.disabilityTypes)
    ? profile.data.disabilityTypes
    : [];

  const personalEmailVerified = Boolean(profile?.personal_email_verified);
  const contactVerified = Boolean(profile?.contact_verified);

  const handleField = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setSavingProfile(true);
    // Changing the mobile or personal email invalidates any prior verification.
    const contactChanged = form.contact_number !== (profile.contact_number ?? "");
    const emailChanged = form.personal_email !== (profile.personal_email ?? "");
    // contactPerson / telNos live in the profile's `data` JSON, not as columns.
    const { contactPerson, telNos, ...columns } = form;
    const updates = {
      ...columns,
      data: { ...(profile.data ?? {}), contactPerson, telNos },
      ...(contactChanged ? { contact_verified: false } : {}),
      ...(emailChanged ? { personal_email_verified: false } : {}),
    };
    const { error } = await updateProfile(profile.id, updates);
    if (error) {
      setProfileMsg(error.message || "Unable to save changes.");
    } else {
      setProfile((prev) => ({ ...prev, ...updates }));
      setProfileMsg("Your personal information has been saved.");
    }
    setSavingProfile(false);
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
    setIsUploading(true);
    const { url, error } = await uploadAvatar(profile.id, file);
    if (error) {
      setAvatarMsg(error.message || "Unable to upload picture.");
    } else {
      setProfile((prev) => ({ ...prev, avatar_url: url }));
      setAvatarMsg("Profile picture updated.");
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setAccountMsg("");
    setSavingAccount(true);
    const messages = [];

    const emailChanged = account.email.trim() && account.email.trim() !== user.email;
    if (emailChanged) {
      const { error } = await updateAccountEmail(account.email.trim());
      if (error) {
        setAccountMsg(error.message || "Unable to update email.");
        setSavingAccount(false);
        return;
      }
      messages.push(
        "A confirmation link was sent to your new email; the change applies once confirmed."
      );
    }

    if (account.password) {
      if (!account.currentPassword) {
        setAccountMsg("Enter your current password to set a new one.");
        setSavingAccount(false);
        return;
      }
      if (account.password.length < 6) {
        setAccountMsg("New password must be at least 6 characters.");
        setSavingAccount(false);
        return;
      }
      if (account.password !== account.confirmPassword) {
        setAccountMsg("New password and confirm password do not match.");
        setSavingAccount(false);
        return;
      }
      const { error: authError } = await signInWithEmail(user.email, account.currentPassword);
      if (authError) {
        setAccountMsg("Current password is incorrect.");
        setSavingAccount(false);
        return;
      }
      const { error } = await updateAccountPassword(account.password);
      if (error) {
        setAccountMsg(error.message || "Unable to update password.");
        setSavingAccount(false);
        return;
      }
      messages.push("Your password has been updated.");
    }

    setAccount((prev) => ({ ...prev, currentPassword: "", password: "", confirmPassword: "" }));
    setAccountMsg(messages.length ? messages.join(" ") : "No changes to save.");
    setSavingAccount(false);
  };

  const sendCode = async () => {
    setOtp((p) => ({ ...p, sending: true, msg: "" }));
    const { ok, sentTo, error } = await sendEmailOtp();
    if (!ok) {
      setOtp((p) => ({ ...p, sending: false, msg: error || "Unable to send code." }));
    } else {
      setOtp((p) => ({
        ...p,
        sending: false,
        msg: `A 6-digit code was sent to ${sentTo}. It expires in 10 minutes.`,
      }));
    }
  };

  const startEmailVerify = async () => {
    setOtp({ open: true, code: "", sending: false, verifying: false, msg: "" });
    await sendCode();
  };

  const confirmCode = async () => {
    if (!/^\d{6}$/.test(otp.code.trim())) {
      setOtp((p) => ({ ...p, msg: "Enter the 6-digit code." }));
      return;
    }
    setOtp((p) => ({ ...p, verifying: true, msg: "" }));
    const { ok, error } = await verifyEmailOtp(otp.code.trim());
    if (!ok) {
      setOtp((p) => ({ ...p, verifying: false, msg: error || "Verification failed." }));
    } else {
      setProfile((prev) => ({ ...prev, personal_email_verified: true }));
      setOtp({ open: false, code: "", sending: false, verifying: false, msg: "" });
      toast.success("Your personal email has been verified.");
    }
  };

  const sendSmsCode = async () => {
    setSmsOtp((p) => ({ ...p, sending: true, msg: "" }));
    const { ok, sentTo, error } = await sendSmsOtp();
    if (!ok) {
      setSmsOtp((p) => ({ ...p, sending: false, msg: error || "Unable to send code." }));
    } else {
      setSmsOtp((p) => ({
        ...p,
        sending: false,
        msg: `A 6-digit code was sent by SMS to ${sentTo}. It expires in 10 minutes.`,
      }));
    }
  };

  const startSmsVerify = async () => {
    setSmsOtp({ open: true, code: "", sending: false, verifying: false, msg: "" });
    await sendSmsCode();
  };

  const confirmSmsCode = async () => {
    if (!/^\d{6}$/.test(smsOtp.code.trim())) {
      setSmsOtp((p) => ({ ...p, msg: "Enter the 6-digit code." }));
      return;
    }
    setSmsOtp((p) => ({ ...p, verifying: true, msg: "" }));
    const { ok, error } = await verifySmsOtp(smsOtp.code.trim());
    if (!ok) {
      setSmsOtp((p) => ({ ...p, verifying: false, msg: error || "Verification failed." }));
    } else {
      setProfile((prev) => ({ ...prev, contact_verified: true }));
      setSmsOtp({ open: false, code: "", sending: false, verifying: false, msg: "" });
      toast.success("Your mobile number has been verified.");
    }
  };

  // Verification requires a saved (not just typed) personal email.
  const emailUnsaved = form.personal_email !== (profile?.personal_email ?? "");
  const canVerifyEmail =
    Boolean(profile?.personal_email) && !personalEmailVerified;

  // Verification requires a saved (not just typed) mobile number.
  const contactUnsaved = form.contact_number !== (profile?.contact_number ?? "");
  const canVerifyContact = Boolean(profile?.contact_number) && !contactVerified;

  if (isLoading) {
    return (
      <div className="gov-card rounded-2xl p-6 text-sm text-[color:var(--gov-muted)]">
        Loading your profile…
      </div>
    );
  }

  if (loadError) {
    return (
      <div role="alert" className="rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification notices — personal email and mobile number */}
      {!personalEmailVerified ? (
        <div role="status" className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--gov-warning-soft)] px-4 py-3 text-sm text-[color:var(--gov-warning-fg)]">
          ⚠ Your personal email address is not verified.
        </div>
      ) : null}
      {!contactVerified ? (
        <div role="status" className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[color:var(--gov-warning-soft)] px-4 py-3 text-sm text-[color:var(--gov-warning-fg)]">
          ⚠ Your mobile number is not verified.
        </div>
      ) : null}

      {/* Profile picture */}
      <section className="gov-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Profile Management</h2>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Update your photo, personal details, and account settings.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-full bg-[color:var(--gov-primary)] text-lg font-semibold text-[color:var(--gov-on-primary)]">
              {initials(form.full_name)}
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="btn btn-primary"
            >
              {isUploading ? "Uploading…" : "Change picture"}
            </button>
            {avatarMsg ? (
              <p className="mt-2 text-xs text-[color:var(--gov-muted)]">
                {avatarMsg}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Disability type & guardian — read-only record info */}
      <section className="gov-card rounded-2xl p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <HeartHandshake
                className="h-4 w-4 text-[color:var(--gov-primary)]"
                aria-hidden="true"
              />
              {disabilityTypes.length === 1
                ? "My disability type"
                : "My disability types"}
            </h3>
            {disabilityTypes.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {disabilityTypes.map((t) => (
                  <span key={t} className="gov-badge gov-badge--info">
                    {DISABILITY_LABELS[t] || t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[color:var(--gov-muted)]">
                No disability type on record.
              </p>
            )}
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <ShieldCheck
                className="h-4 w-4 text-[color:var(--gov-primary)]"
                aria-hidden="true"
              />
              {guardians.length === 1 ? "My guardian" : "My guardians"}
            </h3>
            {guardians.length > 0 ? (
              <div className="mt-3 space-y-3">
                {guardians.map((g) => {
                  const active = g.guardian_active !== false;
                  return (
                    <div
                      key={g.id}
                      className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[color:var(--gov-border)] p-3"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--gov-primary)] text-sm font-semibold text-[color:var(--gov-on-primary)]">
                        {guardianInitials(g.guardian_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[color:var(--gov-text)]">
                            {g.guardian_name || "—"}
                          </p>
                          <span
                            className={`gov-badge ${
                              active ? "gov-badge--success" : "gov-badge--danger"
                            }`}
                          >
                            {active ? "Active" : "Deactivated"}
                          </span>
                        </div>
                        {g.relationship ? (
                          <p className="text-xs text-[color:var(--gov-muted)]">
                            {g.relationship}
                          </p>
                        ) : null}
                        {g.guardian_phone ? (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-[color:var(--gov-muted)]">
                            <Phone
                              className="h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            {g.guardian_phone}
                          </p>
                        ) : null}
                        {!active ? (
                          <p className="mt-2 flex items-start gap-1.5 text-xs text-[color:var(--gov-warning-fg)]">
                            <AlertTriangle
                              className="mt-0.5 h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            This guardian account has been deactivated by PDAO.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[color:var(--gov-muted)]">
                No guardian is linked to your account.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Personal information */}
      <section className="gov-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold">Personal information</h3>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSaveProfile}>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="full_name">
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleField}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="contact_number">
              Mobile number
              {contactVerified ? (
                <span className="ml-2 text-xs font-semibold text-[color:var(--gov-success-fg)]">
                  Verified
                </span>
              ) : (
                <span className="ml-2 text-xs font-semibold text-[color:var(--gov-warning-fg)]">
                  Not verified
                </span>
              )}
            </label>
            <input
              id="contact_number"
              name="contact_number"
              type="tel"
              value={form.contact_number}
              onChange={handleField}
              className={fieldClass}
              placeholder="09xx xxx xxxx"
            />
            {canVerifyContact && !smsOtp.open ? (
              <div className="mt-2">
                {contactUnsaved ? (
                  <p className="text-xs text-[color:var(--gov-warning-fg)]">
                    Save your changes first, then verify this number.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={startSmsVerify}
                    className="text-xs font-semibold text-[color:var(--gov-primary)] hover:underline"
                  >
                    Verify this number
                  </button>
                )}
              </div>
            ) : null}
            {smsOtp.open ? (
              <div className="mt-3 rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-3">
                <p className="text-xs font-medium text-[color:var(--gov-text)]">
                  Enter the 6-digit code sent by SMS
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={smsOtp.code}
                    onChange={(e) =>
                      setSmsOtp((p) => ({
                        ...p,
                        code: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    className="gov-input w-32 text-center tracking-[0.3em]"
                    placeholder="000000"
                  />
                  <button
                    type="button"
                    onClick={confirmSmsCode}
                    disabled={smsOtp.verifying}
                    className="btn btn-primary h-9 px-3 text-xs"
                  >
                    {smsOtp.verifying ? "Verifying…" : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={sendSmsCode}
                    disabled={smsOtp.sending}
                    className="text-xs font-semibold text-[color:var(--gov-primary)] hover:underline disabled:opacity-60"
                  >
                    {smsOtp.sending ? "Sending…" : "Resend code"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSmsOtp({
                        open: false,
                        code: "",
                        sending: false,
                        verifying: false,
                        msg: "",
                      })
                    }
                    className="text-xs font-semibold text-[color:var(--gov-muted)]"
                  >
                    Cancel
                  </button>
                </div>
                {smsOtp.msg ? (
                  <p className="mt-2 text-xs text-[color:var(--gov-muted)]">
                    {smsOtp.msg}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="personal_email">
              Personal email address
              {personalEmailVerified ? (
                <span className="ml-2 text-xs font-semibold text-[color:var(--gov-success-fg)]">
                  Verified
                </span>
              ) : (
                <span className="ml-2 text-xs font-semibold text-[color:var(--gov-warning-fg)]">
                  Not verified
                </span>
              )}
            </label>
            <input
              id="personal_email"
              name="personal_email"
              type="email"
              value={form.personal_email}
              onChange={handleField}
              className={fieldClass}
              placeholder="name@example.com"
            />
            {canVerifyEmail && !otp.open ? (
              <div className="mt-2">
                {emailUnsaved ? (
                  <p className="text-xs text-[color:var(--gov-warning-fg)]">
                    Save your changes first, then verify this email.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={startEmailVerify}
                    className="text-xs font-semibold text-[color:var(--gov-primary)] hover:underline"
                  >
                    Verify this email
                  </button>
                )}
              </div>
            ) : null}
            {otp.open ? (
              <div className="mt-3 rounded-xl border border-[color:var(--gov-border)] bg-[color:var(--gov-surface)] p-3">
                <p className="text-xs font-medium text-[color:var(--gov-text)]">
                  Enter the 6-digit code sent to your email
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp.code}
                    onChange={(e) =>
                      setOtp((p) => ({
                        ...p,
                        code: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    className="gov-input w-32 text-center tracking-[0.3em]"
                    placeholder="000000"
                  />
                  <button
                    type="button"
                    onClick={confirmCode}
                    disabled={otp.verifying}
                    className="btn btn-primary h-9 px-3 text-xs"
                  >
                    {otp.verifying ? "Verifying…" : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={sendCode}
                    disabled={otp.sending}
                    className="text-xs font-semibold text-[color:var(--gov-primary)] hover:underline disabled:opacity-60"
                  >
                    {otp.sending ? "Sending…" : "Resend code"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setOtp({
                        open: false,
                        code: "",
                        sending: false,
                        verifying: false,
                        msg: "",
                      })
                    }
                    className="text-xs font-semibold text-[color:var(--gov-muted)]"
                  >
                    Cancel
                  </button>
                </div>
                {otp.msg ? (
                  <p className="mt-2 text-xs text-[color:var(--gov-muted)]">
                    {otp.msg}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="birthdate">
              Birthdate
            </label>
            <input
              id="birthdate"
              name="birthdate"
              type="date"
              value={form.birthdate}
              onChange={handleField}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="sex">
              Sex
            </label>
            <select
              id="sex"
              name="sex"
              value={form.sex}
              onChange={handleField}
              className={fieldClass}
            >
              {SEX_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="civil_status">
              Civil status
            </label>
            <select
              id="civil_status"
              name="civil_status"
              value={form.civil_status}
              onChange={handleField}
              className={fieldClass}
            >
              {CIVIL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="address">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleField}
              className={fieldClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="barangay">
              Barangay
            </label>
            <input
              id="barangay"
              name="barangay"
              type="text"
              value={form.barangay}
              onChange={handleField}
              className={fieldClass}
            />
          </div>
          <div className="sm:col-span-2">
            <h4 className="text-sm font-semibold text-[color:var(--gov-text)]">
              In case of emergency, please notify
            </h4>
            <p className="mt-1 text-xs text-[color:var(--gov-muted)]">
              This appears on the back of your Digital PWD ID.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="contactPerson">
              Emergency contact person
            </label>
            <input
              id="contactPerson"
              name="contactPerson"
              type="text"
              value={form.contactPerson}
              onChange={handleField}
              className={fieldClass}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="telNos">
              Emergency contact number
            </label>
            <input
              id="telNos"
              name="telNos"
              type="tel"
              value={form.telNos}
              onChange={handleField}
              className={fieldClass}
              placeholder="09xx xxx xxxx"
            />
          </div>
          {profileMsg ? (
            <p className="sm:col-span-2 text-sm text-[color:var(--gov-muted)]">
              {profileMsg}
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary"
            >
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Account settings — separate form */}
      <section className="gov-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold">Account settings</h3>
        <p className="mt-2 text-sm text-[color:var(--gov-muted)]">
          Manage the email and password you use to sign in. This is separate
          from your personal email above.
        </p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSaveAccount}>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="account-email">
              Login email
            </label>
            <input
              id="account-email"
              type="email"
              value={account.email}
              onChange={(e) =>
                setAccount((prev) => ({ ...prev, email: e.target.value }))
              }
              className={fieldClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="account-current-password">
              Current password
            </label>
            <p className="mt-1 text-xs text-[color:var(--gov-muted)]">
              Required only when changing your password.
            </p>
            <input
              id="account-current-password"
              type="password"
              value={account.currentPassword}
              onChange={(e) =>
                setAccount((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              className={fieldClass}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="account-password">
              New password
            </label>
            <input
              id="account-password"
              type="password"
              value={account.password}
              onChange={(e) =>
                setAccount((prev) => ({ ...prev, password: e.target.value }))
              }
              className={fieldClass}
              placeholder="Leave blank to keep current"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="account-confirm-password">
              Confirm new password
            </label>
            <input
              id="account-confirm-password"
              type="password"
              value={account.confirmPassword}
              onChange={(e) =>
                setAccount((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              className={fieldClass}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </div>
          {accountMsg ? (
            <p className="sm:col-span-2 text-sm text-[color:var(--gov-muted)]">
              {accountMsg}
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={savingAccount}
              className="btn btn-primary"
            >
              {savingAccount ? "Saving…" : "Update account"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
