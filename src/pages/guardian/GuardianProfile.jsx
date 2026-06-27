import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { AlertTriangle, Camera, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import PasswordField from "../../components/ui/PasswordField.jsx";
import {
  signInWithEmail,
  updateAccountName,
  updateAccountPhone,
  uploadAccountAvatar,
} from "../../services/supabase/auth.js";
import {
  updateAccountEmail,
  updateAccountPassword,
} from "../../services/supabase/profile.js";

const initial = (name, email) =>
  (name || email || "?").trim().slice(0, 1).toUpperCase();

// PH mobile: 11 digits starting 09, or +639 followed by 9 digits.
const PH_MOBILE_RE = /^(09\d{9}|\+639\d{9})$/;
const isValidPhone = (v) => PH_MOBILE_RE.test((v || "").replace(/\s/g, ""));

export default function GuardianProfile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    contactNumber: user?.contactNumber ?? "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const avatarInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState("");

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
    const { url, error: uploadError } = await uploadAccountAvatar(file);
    if (uploadError) {
      setAvatarMsg(uploadError.message || "Unable to upload picture.");
    } else {
      setUser((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
      toast.success("Profile picture updated.");
    }
    setUploadingAvatar(false);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!form.fullName.trim()) {
      setError("Full name cannot be empty.");
      return;
    }

    setSaving(true);
    const messages = [];

    if (form.fullName.trim() !== (user?.fullName ?? "")) {
      const { error: nameError } = await updateAccountName(form.fullName.trim());
      if (nameError) {
        setError(nameError.message || "Unable to update your name.");
        setSaving(false);
        return;
      }
      messages.push("Your name has been updated.");
    }

    const emailChanged =
      form.email.trim() && form.email.trim() !== (user?.email ?? "");
    if (emailChanged) {
      const { error: emailError } = await updateAccountEmail(form.email.trim());
      if (emailError) {
        setError(emailError.message || "Unable to update email.");
        setSaving(false);
        return;
      }
      messages.push(
        "A confirmation link was sent to your new email; the change applies once confirmed."
      );
    }

    const phoneChanged =
      form.contactNumber.trim() !== (user?.contactNumber ?? "");
    if (phoneChanged) {
      if (form.contactNumber.trim() && !isValidPhone(form.contactNumber)) {
        setError("Enter a valid mobile number (e.g. 09171234567).");
        setSaving(false);
        return;
      }
      const { error: phoneError } = await updateAccountPhone(
        form.contactNumber.trim()
      );
      if (phoneError) {
        setError(phoneError.message || "Unable to update mobile number.");
        setSaving(false);
        return;
      }
      setUser((prev) =>
        prev
          ? {
              ...prev,
              contactNumber: form.contactNumber.trim(),
              contactNumberVerified: false,
            }
          : prev
      );
      messages.push("Your mobile number has been updated.");
    }

    if (form.password) {
      if (!form.currentPassword) {
        setError("Enter your current password to set a new one.");
        setSaving(false);
        return;
      }
      if (form.password.length < 6) {
        setError("New password must be at least 6 characters.");
        setSaving(false);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("New password and confirm password do not match.");
        setSaving(false);
        return;
      }
      const { error: authError } = await signInWithEmail(
        user.email,
        form.currentPassword
      );
      if (authError) {
        setError("Current password is incorrect.");
        setSaving(false);
        return;
      }
      const { error: passError } = await updateAccountPassword(form.password);
      if (passError) {
        setError(passError.message || "Unable to update password.");
        setSaving(false);
        return;
      }
      messages.push("Your password has been updated.");
    }

    setForm((prev) => ({
      ...prev,
      currentPassword: "",
      password: "",
      confirmPassword: "",
    }));
    if (messages.length) {
      setMsg(messages.join(" "));
      toast.success("Profile updated.");
    } else {
      setMsg("No changes to save.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-[-0.01em]">My profile</h2>
        <p className="mt-1 text-[color:var(--gov-muted)]">
          Update your photo, name, login email, mobile number, and password.
        </p>
      </header>

      <section className="gov-card p-6">
        {/* Profile picture */}
        <div className="flex flex-wrap items-center gap-5">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-full bg-[color:var(--gov-primary)] text-lg font-semibold text-[color:var(--gov-on-primary)]">
              {initial(form.fullName, user?.email)}
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

        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSave}>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium" htmlFor="g-name">
              Full name<span className="text-[color:var(--gov-danger-fg)]"> *</span>
            </label>
            <input
              id="g-name"
              type="text"
              value={form.fullName}
              onChange={(e) =>
                setForm((p) => ({ ...p, fullName: e.target.value }))
              }
              className="gov-input"
              placeholder="Your full name"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium" htmlFor="g-email">
              Login email
            </label>
            <input
              id="g-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="gov-input"
              placeholder="name@example.com"
              autoComplete="username"
            />
          </div>
          <div className="sm:col-span-2">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium" htmlFor="g-phone">
                Mobile number
              </label>
              {user?.contactNumber ? (
                user.contactNumberVerified ? (
                  <span className="gov-badge gov-badge--success">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Verified
                  </span>
                ) : (
                  <span className="gov-badge gov-badge--warning">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    Not verified
                  </span>
                )
              ) : null}
            </div>
            <input
              id="g-phone"
              type="tel"
              inputMode="numeric"
              value={form.contactNumber}
              onChange={(e) =>
                setForm((p) => ({ ...p, contactNumber: e.target.value }))
              }
              className="gov-input"
              placeholder="09171234567"
              autoComplete="tel"
              aria-invalid={
                Boolean(form.contactNumber.trim()) &&
                !isValidPhone(form.contactNumber)
              }
            />
            <p className="mt-1 text-xs text-[color:var(--gov-muted)]">
              {form.contactNumber.trim() && !isValidPhone(form.contactNumber)
                ? "Enter a valid mobile number (e.g. 09171234567)."
                : "Used by PDAO to reach you about your ward. Verification by SMS is coming soon."}
            </p>
          </div>
          <div className="sm:col-span-2">
            <PasswordField
              id="g-current"
              label="Current password"
              hint="Required only when changing your password."
              value={form.currentPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, currentPassword: e.target.value }))
              }
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
          </div>
          <PasswordField
            id="g-password"
            label="New password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="Leave blank to keep current"
          />
          <PasswordField
            id="g-confirm"
            label="Confirm new password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm((p) => ({ ...p, confirmPassword: e.target.value }))
            }
            placeholder="Re-enter new password"
          />

          {error ? (
            <div
              role="alert"
              className="sm:col-span-2 rounded-[var(--radius-md)] bg-[color:var(--gov-danger-soft)] px-4 py-3 text-sm text-[color:var(--gov-danger-fg)]"
            >
              {error}
            </div>
          ) : null}
          {msg ? (
            <p className="sm:col-span-2 text-sm text-[color:var(--gov-muted)]">
              {msg}
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? "Saving…" : "Update profile"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
